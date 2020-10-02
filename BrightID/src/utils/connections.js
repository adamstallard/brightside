// @flow
import { TIME_FUDGE } from '@/utils/constants';
import { strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import nacl from 'tweetnacl';
import api from '@/api/brightId';
import stringify from 'fast-json-stable-stringify';

type initiateConnectionParams = {
  myBrightId: string,
  secretKey: string,
  connection: PendingConnection,
  connectionTimestamp: number,
  channel: Channel,
};

export const initiateConnectionRequest = async ({
  myBrightId,
  secretKey,
  connectionTimestamp,
  channel,
  connection,
}: initiateConnectionParams) => {
  const message = `Add Connection${myBrightId}${connection.brightId}${connectionTimestamp}`;
  console.log(`Initiator: Signing connection message: ${message}`);
  const signedMessage = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), secretKey),
  );

  // bring signedmessage to peer so he knows i want to connect with him...
  console.log(
    `Uploading signed connection string for ${connection.name} to channel ${connection.id}`,
  );
  const data = {
    signedMessage,
    connectionTimestamp,
  };

  await channel.api.upload({
    channelId: connection.id,
    data,
    dataId: channel.myProfileId,
  });

  const apiVersion = 5;
  const opName = 'Add Connection';
  const op = {
    name: opName,
    id1: myBrightId,
    id2: connection.brightId,
    timestamp: connectionTimestamp,
    v: apiVersion,
  };
  const opMessage = stringify(op);

  return {
    opName,
    opMessage,
  };
};

type respondToConnectionParams = {
  otherBrightId: string,
  signedMessage: string,
  timestamp: number,
  myBrightId: string,
  secretKey: string,
};

export const respondToConnectionRequest = async ({
  otherBrightId,
  signedMessage,
  timestamp,
  myBrightId,
  secretKey,
}: respondToConnectionParams) => {
  // The other user signed a connection request; we have enough info to
  // make an API call to create the connection.
  if (timestamp > Date.now() + TIME_FUDGE) {
    throw new Error("timestamp can't be in the future");
  }

  const message = `Add Connection${otherBrightId}${myBrightId}${timestamp}`;
  console.log(`Responder: Signing connection message: ${message}`);
  const mySignedMessage = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), secretKey),
  );
  await api.createConnection(
    otherBrightId,
    signedMessage,
    myBrightId,
    mySignedMessage,
    timestamp,
  );
};
