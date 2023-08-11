import { getVariableFromSSM } from "../helpers";

export const authenticate = async (
  header: string,
  payload: string
): Promise<boolean> => {
  // Get Github Secret
  const githubSecret = await getVariableFromSSM(
    process.env.GITHUB_SECRET_PARAM_NAME ?? ""
  );

  //Import Key
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(githubSecret);
  const algorithm = { name: "HMAC", hash: { name: "SHA-256" } };
  const extractable = false;
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    algorithm,
    extractable,
    ["sign", "verify"]
  );

  // Verify Token
  const sigHex = header.split("=")[1];
  const sigBytes = hexToBytes(sigHex);
  const dataBytes = encoder.encode(payload);
  const equal = await crypto.subtle.verify(
    algorithm.name,
    key,
    sigBytes,
    dataBytes
  );

  return equal;
};

function hexToBytes(hex: string) {
  let len = hex.length / 2;
  let bytes = new Uint8Array(len);

  let index = 0;
  for (let i = 0; i < hex.length; i += 2) {
    let c = hex.slice(i, i + 2);
    let b = parseInt(c, 16);
    bytes[index] = b;
    index += 1;
  }

  return bytes;
}
