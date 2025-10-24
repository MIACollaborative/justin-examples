import { HTTPMethods, JGuard, DEFAULT_GUARDS } from "@just-in/server";
import { guardCustom } from "./guards";

const usersGuardsMap = new Map<
    string,
    Map<HTTPMethods, JGuard[]>
  >();

  usersGuardsMap.set("/api/users", new Map());
  usersGuardsMap
    .get("/api/users")
    ?.set(HTTPMethods.GET, [guardCustom]);

    usersGuardsMap
    .get("/api/users")
    ?.set(HTTPMethods.POST, [guardCustom]);

  usersGuardsMap.set("/api/users/:userUniqueIdentifier", new Map());
  usersGuardsMap
    .get("/api/users/:userUniqueIdentifier")
    ?.set(HTTPMethods.GET, [guardCustom]);
  usersGuardsMap
    .get("/api/users/:userUniqueIdentifier")
    ?.set(HTTPMethods.PATCH, [guardCustom]);
  usersGuardsMap
    .get("/api/users/:userUniqueIdentifier")
    ?.set(HTTPMethods.DELETE, [guardCustom]);


export { usersGuardsMap };