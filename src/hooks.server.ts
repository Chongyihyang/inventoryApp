import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import { departmentTable, usersTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	const department = await db
	.select({
		username: usersTable.username,
		departmentname: departmentTable.departmentname
	})
	.from(departmentTable)
	.leftJoin(usersTable, eq(usersTable.departmentid, departmentTable.id))
	.where(eq(usersTable.username, user?.username));

	event.locals.user = user
	event.locals.session = session
	event.locals.department = department[0].departmentname
	return resolve(event);
};

export const handle: Handle = handleAuth;
