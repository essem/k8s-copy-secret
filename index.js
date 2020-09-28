const core = require("@actions/core");
const childProcess = require("child_process");

// To test in shell
// env 'INPUT_FROM-NAMESPACE=default' 'INPUT_TO-NAMESPACE=test' 'INPUT_SECRET-NAME=tls-secret' node index.js

function getSecret(namespace, secretName) {
  const command = `kubectl get secret ${secretName} --namespace=${namespace} -o json`;
  console.log(`Command: ${command}`);

  const output = childProcess.execSync(command);
  const manifest = JSON.parse(output.toString());
  delete manifest.metadata.creationTimestamp;
  delete manifest.metadata.managedFields;
  delete manifest.metadata.namespace;
  delete manifest.metadata.resourceVersion;
  delete manifest.metadata.selfLink;
  delete manifest.metadata.uid;
  return manifest;
}

function apply(namespace, manifest) {
  const command = `kubectl apply --namespace=${namespace} -f -`;
  console.log(`Command: ${command}`);

  const output = childProcess.execSync(command, { input: manifest });
  console.log(output.toString());
}

try {
  const fromNamespace = core.getInput("from-namespace");
  const toNamespace = core.getInput("to-namespace");
  const secretName = core.getInput("secret-name");

  const manifest = getSecret(fromNamespace, secretName);
  apply(toNamespace, JSON.stringify(manifest));
} catch (err) {
  console.log(`error: ${err.toString()}`);
}
