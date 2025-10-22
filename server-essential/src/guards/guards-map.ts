import { HTTPMethods, JGuard, DEFAULT_GUARDS } from "@just-in/server";
import { guardGeneric, permissionGuardGeneric, requestTokenValidatorGuard } from "./guards";

const usersGuardsMap = new Map<
    string,
    Map<HTTPMethods, JGuard[]>
  >();

  usersGuardsMap.set("/api/users", new Map());
  usersGuardsMap
    .get("/api/users")
    ?.set(HTTPMethods.GET, [guardGeneric]);
  usersGuardsMap
    .get("/api/users")
    ?.set(HTTPMethods.POST, [guardGeneric]);
  usersGuardsMap.set("/api/users/:userUniqueIdentifier", new Map());
  usersGuardsMap
    .get("/api/users/:userUniqueIdentifier")
    ?.set(HTTPMethods.GET, [guardGeneric]);
  usersGuardsMap
    .get("/api/users/:userUniqueIdentifier")
    ?.set(HTTPMethods.PATCH, [guardGeneric]);
  usersGuardsMap
    .get("/api/users/:userUniqueIdentifier")
    ?.set(HTTPMethods.DELETE, [guardGeneric]);


export { usersGuardsMap };