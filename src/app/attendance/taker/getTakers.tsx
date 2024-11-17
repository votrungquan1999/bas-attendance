const members = [
	"Xu (Quỳnh Anh)",
	"Thắm",
	"Helen",
	"Ánh",
	"CLinh",
	"Ngọc",
	"Phương",
	"Đan",
	"An",
	"Thuý",
	"Tự",
];
// create a list of takers with key and value
const takers = members.map((member, index) => ({
	id: index.toString(),
	value: member,
}));

export type Taker = {
	id: string;
	value: string;
};

export async function getTakers() {
	const testUser = {
		id: "test_user",
		value: "Test User",
	};

	return [...takers, testUser];
}
