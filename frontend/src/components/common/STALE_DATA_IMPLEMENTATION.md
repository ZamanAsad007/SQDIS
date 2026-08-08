# Stale Data UX Implementation Guide

## Overview
This document outlines how stale data indicators and offline fallback behavior are wired into feature components.

## Pattern
1. Wrap query components with `<StaleDataWrapper isStale={isStale} onRefresh={refetch}>`.
2. Display `<ConnectivityBanner />` at application layout root (`MainLayout.tsx`).
3. Leverage `useStaleDataIndicator(dataUpdatedAt)` for automatic age computation.
