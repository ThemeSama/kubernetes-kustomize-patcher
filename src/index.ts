import express, { Request, Response } from "express";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { getDeploymentPatch } from "./operations/get-deployment-patch.js";
import { now } from "./helper/date.js";
import { createPatch } from "rfc6902";
import { updatePatchDeploymentCount } from "./operations/update-patch-deployment-count.js";

const app = express();
const httpPort = 3000;
const httpsPort = 8443;

// json
app.use(express.json());

// certificates

const keyPath = path.join(__dirname, "../certs/tls.key");
const certPath = path.join(__dirname, "../certs/tls.crt");
const key = fs.readFileSync(keyPath);
const cert = fs.readFileSync(certPath);

//
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/mutate", async (req: Request, res: Response) => {
  const admissionReview = req.body,
    { uid, name: deploymentName, namespace } = admissionReview.request;

  // get patches
  const patchDetails = await getDeploymentPatch(deploymentName, namespace);

  if (Array.isArray(patchDetails) && patchDetails.length) {
    const patchList = patchDetails
      .map((patchDetail) =>
        createPatch(admissionReview.request.object, patchDetail?.spec.patch)
      )
      .flat(1);

    const additivePatch = patchList.filter(
      (p) => p.op === "replace" || p.op === "add"
    );

    console.log(
      `${now()} [INFO] ${admissionReview.request.name} deployment in ${
        admissionReview.request.namespace
      } namespace has been updated.`
    );

    const response = {
      apiVersion: "admission.k8s.io/v1",
      kind: "AdmissionReview",
      response: {
        uid,
        allowed: true,
        patchType: "JSONPatch",
        patch: Buffer.from(JSON.stringify(additivePatch)).toString("base64"),
      },
    };

    //
    await updatePatchDeploymentCount(deploymentName, namespace);

    return res.json(response);
  } else {
    return res.json({
      apiVersion: "admission.k8s.io/v1",
      kind: "AdmissionReview",
      response: {
        uid,
        allowed: true,
      },
    });
  }
});

http.createServer(app).listen(httpPort, "0.0.0.0");
https
  .createServer({ key: key, cert: cert }, app)
  .listen(httpsPort, "0.0.0.0", () => {
    console.log(
      `🔒 Kustomize Patcher HTTPS Server started on port ${httpsPort}`
    );
  });
