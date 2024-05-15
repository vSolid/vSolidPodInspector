import {
  isRawData,
  responseToResourceInfo,
  responseToSolidDataset,
} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useLocation } from "react-router-dom";
import Explorer, { Resource } from "./components/Explorer";
import Toolbar from "./components/ui/ToolBar";
import { ResourceContext } from "./contexts/resource";
import "./index.css";

export function ServerUI() {
  
  const location = useLocation();
  const [resource, setResource] = useState<Resource>();

  async function fetchResource() {
    let res = await fetch(location.pathname);

    const resourceInfo = responseToResourceInfo(res);

    if (isRawData(resourceInfo)) {
      // Unstructured Data (Non-RDF Resource)
      setResource({
        ...resourceInfo,
        blob: await res.blob(),
      });
    } else {
      // Structured Data (RDF Resource)
      setResource(await responseToSolidDataset(res));
    }
  }

  useEffect(() => {
    fetchResource();
  }, [location]);

  return (
    <div className="lg:w-1/2 m-auto lg:my-8">
      <ResourceContext.Provider
        value={{ resource, fetchResource, url: window.location.href, error: null, serverUI: true }}
      >
        <Toolbar />
        <Explorer />
      </ResourceContext.Provider>
      <p>Custom server UI {window.location.href}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ServerUI />
    </BrowserRouter>
  </React.StrictMode>
);
