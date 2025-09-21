## Role-Based Access Control (RBAC)

This system introduces a coarse-grained role field on `authentication.User` plus capability
helpers and DRF permissions/mixins for consistent authorization decisions.

### Role Hierarchy (least → most privilege)
`viewer` → `staff` → `accountant` → `manager` → `admin`

### Capabilities Summary

| Role        | manage_users | edit_finances | view_finances | approve_orders | edit_inventory | view_reports | create_transactions | readonly |
|-------------|--------------|---------------|---------------|----------------|----------------|--------------|---------------------|----------|
| viewer      | ❌           | ❌            | ✅            | ❌             | ❌             | ✅           | ❌                  | ✅       |
| staff       | ❌           | ❌            | ✅            | ❌             | ❌             | ✅           | ✅                  | ❌       |
| accountant  | ❌           | ✅            | ✅            | ❌             | ❌             | ✅           | ✅                  | ❌       |
| manager     | ❌           | ✅            | ✅            | ✅             | ✅             | ✅           | ✅                  | ❌       |
| admin       | ✅           | ✅            | ✅            | ✅             | ✅             | ✅           | ✅                  | ❌       |

### Helper Methods (User model)
Use these instead of checking raw `user.role` wherever possible:

```python
user.can_manage_users()
user.can_edit_finances()
user.can_view_finances()
user.can_approve_orders()
user.can_edit_inventory()
user.can_view_reports()
user.can_create_transactions()
user.effective_capabilities()  # returns a list of capability strings
```

### DRF Permissions
Located in `authentication/permissions.py`:

- `IsAdmin`
- `IsManagerOrAdmin`
- `CanEditFinances`
- `CanApproveOrders`
- `CanViewReports`
- `CanCreateTransactions`
- `ReadOnlyOrViewer` (safe methods allowed for any authenticated user; write requires non-viewer)

### View Mixins
Located in `authentication/mixins.py`:

- `CapabilityRequiredMixin` (`required_capability = "can_edit_finances"` etc.)
- `ManagerOrAdminRequiredMixin`
- `AdminRequiredMixin`

### Audit Logging
Signals in `authentication/signals.py` emit:

```
role_change user=<user> from=<old> to=<new> department=<dept>
capabilities_snapshot user=<user> role=<role> caps=<capability list>
```

Permission evaluations and mixin checks log lines beginning with `rbac_check` or `mixin_...` to the logger `auth.rbac`.

### Production Notes
- Combine with fine-grained Django permissions / object-level checks where needed.
- Use groups for additional modular permission scoping beyond the coarse role.
- Ensure logs are shipped to your central log aggregation for audit requirements.

### Future Extensions
- Add per-department scoping checks.
- Introduce feature flags mapping to capabilities.
- Enforce row-level permissions via QuerySet filters.
