This folder hosts thin HTTP controllers that delegate to domain services.
Existing legacy route files remain for backward-compat; during the refactor, do not delete originals.

Conventions:
- export named handlers: `export async function someHandler(req,res,next){}`
- keep validation/shape/response mapping here; call services for domain logic.
