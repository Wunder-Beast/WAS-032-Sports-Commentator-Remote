import { db } from "@/server/db";
import { users } from "@/server/db/schema";

const seedUsers = [
	{
		email: "jon@wunderbeast.com",
		name: "Jon",
		role: "super" as const,
	},
	{
		email: "steve@wunderbeast.com",
		name: "Steve",
		role: "super" as const,
	},
	{
		email: "james@wunderbeast.com",
		name: "James",
		role: "super" as const,
	},
];

async function seed() {
	console.log("🌱 Seeding database...");

	try {
		for (const user of seedUsers) {
			await db.insert(users).values(user).onConflictDoNothing();
			console.log(`✅ User ${user.email} seeded`);
		}

		console.log("🎉 Database seeding completed!");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	seed()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}

export { seed };
