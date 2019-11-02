import express from "express";

export default function loadEndpoints(server: express.Express, endpoints) {
  let endpointVersions = Object.keys(endpoints);
  endpointVersions.map(eV => {
    endpoints[eV].map(e => {
      if (typeof e.path === "string")
        import(`../../endpoints/${eV}/${e.handler}`)
          .then(module => server.get(e.path, module.handler))
          .catch(() => {});
      else
        e.path.map((path: string) =>
          import(`../../endpoints/${eV}/${e.handler}`)
            .then(module => server.get(path, module.handler))
            .catch(() => {})
        );
    });
  });
}
