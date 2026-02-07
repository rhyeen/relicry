import { AdminRole, hasRole } from '@/entities/AdminRole';
import { User } from '@/entities/User';
import { appAdmin, firestoreAdmin } from '@/lib/firebaseAdmin';
import { UserDB } from './db/user.db';
import { NextResponse } from 'next/server';
import assert from 'assert';

export class NextResponseError extends Error {
  public status: number;
  constructor(message: string, status: number, log?: string) {
    super(message);
    this.status = status;
    if (log) {
      console.info(message + ': ' + log);
    }
  }
}

export class Unauthorized extends NextResponseError {
  constructor(log?: string) {
    super('Unauthorized', 401, log);
  }
}

export class BadRequest extends NextResponseError {
  constructor(log?: string) {
    super('Bad Request', 400, log);
  }
}

export class InvalidArgument extends NextResponseError {
  constructor(propertyKeyPath: string[], expectedValue: string, log?: string) {
    super('Invalid Argument: ' + propertyKeyPath.join('.') + ' expected ' + expectedValue, 422, log);
  }
}

export class NotFound extends NextResponseError {
  public entity: string;
  constructor(entity: string, log?: string) {
    super('Not Found', 404, log);
    this.entity = entity;
  }
}

export function handleJsonResponse(data: object): NextResponse {
  return NextResponse.json(data);
}

export function handleOkResponse(): NextResponse {
  return NextResponse.json({ ok: true });
}

export function handleRouteError(e: unknown): NextResponse {
  if (!(e instanceof NextResponseError)) {
    console.error('Unhandled error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  return NextResponse.json({ error: e.message }, { status: e.status });
}

export async function authenticateUser(
  req: Request,
  requirements?: {
    // @NOTE: Admin roles are hierarchical, so specify the lowest role required.
    adminRole?: AdminRole;
  },
): Promise<{
  firebase: {
    uid: string;
    emailVerified: boolean;
    email: string | null;
  };
  user: User;
  userId: string;
}> {
  const auth = await authenticate(req, { user: true }, { signedIn: true, ...requirements });
  assert(auth.firebase.uid);
  assert(auth.user);
  assert(auth.userId);
  return {
    firebase: {
      uid: auth.firebase.uid,
      emailVerified: auth.firebase.emailVerified,
      email: auth.firebase.email,
    },
    user: auth.user,
    userId: auth.userId,
  };
}

export async function authenticateFirebase(
  req: Request,
): Promise<{
  uid: string;
  emailVerified: boolean;
  email: string | null;
}> {
  const auth = await authenticate(req, { user: false }, { signedIn: true });
  assert(auth.firebase.uid);
  return {
    uid: auth.firebase.uid,
    emailVerified: auth.firebase.emailVerified,
    email: auth.firebase.email,
  };
}

export async function authenticate(
  req: Request,
  additionalReturn: {
    user: boolean;
  },
  requirements: {
    signedIn?: boolean;
    // @NOTE: Admin roles are hierarchical, so specify the lowest role required.
    adminRole?: AdminRole;
  },
): Promise<{
  firebase: {
    uid: string | null;
    emailVerified: boolean;
    email: string | null;
  };
  user: User | null;
  userId: string | null;
}> {
  const firebaseData = await getFirebaseData(req);
  const returnData = {
    firebase: {
      uid: firebaseData?.uid ?? null,
      emailVerified: firebaseData?.emailVerified ?? false,
      email: firebaseData?.email ?? null,
    },
    user: null as User | null,
    userId: null as string | null,
  };
  if (!firebaseData.uid) {
    if (requirements.signedIn) {
      throw new Unauthorized('No valid Firebase ID token provided');
    }
    return returnData;
  }
  if (additionalReturn.user || requirements.adminRole) {
    const db = new UserDB(firestoreAdmin);
    let user: User | null = await db.getByFirebaseUid(firebaseData.uid);
    if (!user) {
      // Create the user
      const id = await db.generateId();
      user = {
        id,
        firebaseUid: firebaseData.uid,
        displayName: '',
        email: firebaseData.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
        adminRoles: [],
      };
      await db.set(user);
    }
    if (requirements.adminRole && !hasRole(user.adminRoles, requirements.adminRole)) {
      throw new Unauthorized(`Lacks required admin role: ${requirements.adminRole}; user: ${user.id}`);
    }
    returnData.user = user;
    returnData.userId = user.id;
  }
  return returnData;
}


async function getFirebaseData(req: Request): Promise<{
  uid: string | null;
  emailVerified: boolean;
  email: string | null;
}> {
  const authHeader = req.headers.get('authorization') || '';
  const m = authHeader.match(/^Bearer (.+)$/);
  if (!m) return {
    uid: null,
    emailVerified: false,
    email: null,
  };
  const idToken = m[1]!;
  const decoded = await appAdmin.auth().verifyIdToken(idToken);
  return {
    uid: decoded.uid || null,
    emailVerified: decoded.email_verified || false,
    email: decoded.email || null,
  };
}
