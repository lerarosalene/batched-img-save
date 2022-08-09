import { fromByteArray, toByteArray } from "base64-js";
import { Message } from "proto/message";

export function encode(data) {
  const error = Message.verify(data);
  if (error) {
    throw new Error(error);
  }

  const message = Message.create(data);
  const buf = Message.encode(message).finish();

  const b64 = fromByteArray(buf);
  return b64;
}

export function decode(data) {
  const buf = toByteArray(data);
  const message = Message.decode(buf);
  const object = Message.toObject(message, { oneofs: true, arrays: true });

  return object;
}
