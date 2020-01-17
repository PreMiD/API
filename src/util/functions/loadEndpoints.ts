import express from "express";

export default function loadEndpoints(server: express.Express, endpoints) {
  let endpointVersions = Object.keys(endpoints);
  endpointVersions.forEach(eV => {
    endpoints[eV].map(e => {
      if (typeof e.path === "string")
        import(`../../endpoints/${eV}/${e.handler}`)
          .then(module =>
            server[e.method ? e.method : "get"](e.path, module.handler)
          )
          .catch(() => {});
      else
        e.path.map((path: string) =>
          import(`../../endpoints/${eV}/${e.handler}`)
            .then(module =>
              server[e.method ? e.method : "get"](path, module.handler)
            )
            .catch(() => {})
        );
    });
  });
}
