import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
<<<<<<< HEAD
import { departmentTable, rolesTable, usersTable } from '$lib/server/db/schema';
=======
import { departmentTable, usersTable } from '$lib/server/db/schema';
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
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
<<<<<<< HEAD
	.where(eq(usersTable.username, user?.username))

	const role = await db
	.select({
		roleid: rolesTable.id
	})
	.from(rolesTable)
	.leftJoin(usersTable, eq(usersTable.roleid, rolesTable.id))
	.where(eq(usersTable.username, user?.username))
=======
	.where(eq(usersTable.username, user?.username));
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719

	event.locals.user = user
	event.locals.session = session
	event.locals.department = department[0].departmentname
<<<<<<< HEAD
	event.locals.role = String(role[0].roleid)
=======
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
	return resolve(event);
};

export const handle: Handle = handleAuth;
