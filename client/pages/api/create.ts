import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
	const userData = req.body.data
	try {
		res.status(200).json(userData)
	} catch (error) {
		console.log("Failure");
	}
}