import pytest
from app.models.code_quality import code_analyzer
from app.schemas.code_quality import (
    CodeAnalysisRequest,
    FileInput,
    QualityGateConfig
)


def test_typescript_complexity_parsing():
    """Verify JavaScript / TypeScript control flows and cognitive nesting are properly computed."""
    ts_content = """
    function processUser(user: User, options?: ProcessOptions): boolean {
        if (!user) {
            return false;
        }

        if (user.isActive && user.hasPermission) {
            for (let i = 0; i < user.roles.length; i++) {
                if (user.roles[i] === 'admin') {
                    return true;
                }
            }
        }

        return user.score > 50 ? true : false;
    }
    """
    comp = code_analyzer._calculate_javascript_typescript_complexity(ts_content, "src/utils/user.ts")
    
    assert comp.path == "src/utils/user.ts"
    # CC should count base (1) + if (3) + for (1) + && (1) + ternary (1) = ~7
    assert comp.cyclomatic_complexity >= 5
    assert comp.cognitive_complexity >= 4
    assert 0.0 <= comp.maintainability_index <= 100.0


def test_expanded_sast_security_rules():
    """Verify path traversal, XSS, insecure deserialization, and secret leaks are flagged."""
    vulnerable_files = [
        FileInput(
            path="src/controllers/file.controller.ts",
            content="""
            import * as path from 'path';
            export function getFile(req, res) {
                const target = path.join('/var/data', req.query.filename);
                return fs.readFileSync(target);
            }
            """
        ),
        FileInput(
            path="src/components/Renderer.tsx",
            content="""
            export function UserWidget({ rawHtml }) {
                return <div dangerouslySetInnerHTML={{ __html: rawHtml }} />;
            }
            """
        ),
        FileInput(
            path="src/services/data_loader.py",
            content="""
            import pickle
            def load_user_session(data):
                return pickle.loads(data)
            """
        ),
        FileInput(
            path="src/config/keys.ts",
            content="""
            export const JWT_SECRET = "jwt_secret = 'super_secret_jwt_token_123456789'";
            """
        )
    ]

    issues = code_analyzer._scan_security(vulnerable_files)
    rule_ids = [issue.rule_id for issue in issues]
    
    assert "path-traversal" in rule_ids
    assert "xss-injection" in rule_ids
    assert "insecure-deserialization" in rule_ids
    assert "generic-token" in rule_ids

    # Verify remediation metadata is present
    for issue in issues:
        assert issue.remediation_advice is not None
        assert issue.remediation_minutes is not None
        assert issue.remediation_minutes > 0


def test_technical_debt_and_quality_gate_passed():
    """Verify clean code passes the Quality Gate with minimal technical debt."""
    clean_files = [
        FileInput(
            path="src/services/math.ts",
            content="""
            export function add(a: number, b: number): number {
                return a + b;
            }
            export function multiply(a: number, b: number): number {
                return a * b;
            }
            """
        )
    ]

    request = CodeAnalysisRequest(
        files=clean_files,
        quality_gate_config=QualityGateConfig(
            max_cognitive_complexity=15,
            max_cyclomatic_complexity=20,
            min_maintainability_index=40.0
        )
    )

    result = code_analyzer.analyze(request)
    
    assert result.total_debt_hours >= 0.0
    assert result.quality_gate is not None
    assert result.quality_gate.status == "PASSED"
    assert result.quality_gate.passed is True
    assert len(result.quality_gate.violations) == 0


def test_quality_gate_failed_on_critical_security():
    """Verify critical security issues trigger a Quality Gate FAILED status."""
    vulnerable_files = [
        FileInput(
            path="src/services/exec.ts",
            content="""
            import { exec } from 'child_process';
            export function runCmd(cmd) {
                return exec(cmd, { shell: true });
            }
            """
        )
    ]

    request = CodeAnalysisRequest(
        files=vulnerable_files,
        quality_gate_config=QualityGateConfig(
            allow_critical_security=False
        )
    )

    result = code_analyzer.analyze(request)
    
    assert result.quality_gate is not None
    assert result.quality_gate.status == "FAILED"
    assert result.quality_gate.passed is False
    assert len(result.quality_gate.violations) > 0
    assert any(v.severity == "CRITICAL" for v in result.quality_gate.violations)


def test_sha256_content_caching_performance():
    """Verify repeat scans reuse cached complexity and security analysis."""
    files = [
        FileInput(
            path="src/utils/cached_sample.ts",
            content="""
            export function calculate(val: number) {
                if (val > 10) {
                    return val * 2;
                }
                return val;
            }
            """
        )
    ]

    req = CodeAnalysisRequest(files=files)
    
    # 1. First run populates cache
    res1 = code_analyzer.analyze(req)
    assert len(code_analyzer._content_complexity_cache) > 0
    assert len(code_analyzer._content_security_cache) > 0

    # 2. Second run reuses cache
    res2 = code_analyzer.analyze(req)
    assert res1.complexity[0].cyclomatic_complexity == res2.complexity[0].cyclomatic_complexity
    assert res1.complexity[0].maintainability_index == res2.complexity[0].maintainability_index
    assert res1.total_debt_hours == res2.total_debt_hours
