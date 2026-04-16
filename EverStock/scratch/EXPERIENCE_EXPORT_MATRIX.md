# Experience Export Matrix (What Is Missing)

## Current Source-Control Reality
Found in update XML:
- sys_ux_lib_asset records: present

Not found in update XML:
- sys_ux_app records
- sys_ux_page_registry records
- sys_ux_screen_type records
- sys_ux_route records
- sys_ux_macroponent records
- sys_ux_event records
- sys_ux_data_broker records

This means the Experience shell metadata is incomplete in source control even though bundle assets exist.

## What To Export From Instance Next
Export these record types for scope x_1984194_everstoc:
1. sys_ux_app
2. sys_ux_page_registry
3. sys_ux_screen_type
4. sys_ux_route
5. sys_ux_macroponent
6. sys_ux_event
7. sys_ux_data_broker
8. sys_ux_lib_asset (already present, still include for consistency)

## Verification After Pull
After export + pull, verify files exist under update/ for each type:
1. sys_ux_app_*.xml
2. sys_ux_page_registry_*.xml
3. sys_ux_screen_type_*.xml
4. sys_ux_route_*.xml
5. sys_ux_macroponent_*.xml
6. sys_ux_event_*.xml
7. sys_ux_data_broker_*.xml

## If Metadata Still Cannot Be Exported
Fallback path:
1. Keep using UI Page shell as MVP interface.
2. Treat UX bundle as static asset only.
3. Rebuild Experience pages/routes in instance with explicit source-control capture after each artifact is created.
