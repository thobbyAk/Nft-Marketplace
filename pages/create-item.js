import { useState } from "react";
import { ethers } from "ethers";
// import { ipfsClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
const ipfsClient = require("ipfs-http-client");

const projectSecret = process.env.NEXT_PUBLIC_PROJECT;
const projectId = "9a90b1de94af4668ab0a611d914dcd32";

// const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const auth =
	"Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = ipfsClient.create({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
	headers: {
		authorization: auth,
	},
});

export default function CreateItem() {
	const [fileUrl, setFileUrl] = useState(null);
	const [formInput, updateFormInput] = useState({
		price: "",
		name: "",
		description: "",
	});
	const router = useRouter();

	async function onChange(e) {
		const file = e.target.files[0];
		console.log("file", file);
		try {
			const added = await client.add(file, {
				progress: (prog) => console.log(`recived:${prog}`),
			});
			const url = `https://ipfs.infura.io/ipfs/${added.path}`;
			setFileUrl(url);
		} catch (e) {}
	}

	async function createItem() {
		const { name, price, description } = formInput;

		if (!name || !description || !price || !fileUrl) return;
		const data = JSON.stringify({
			name,
			description,
			image: fileUrl,
		});

		try {
			const added = await client.add(data);
			const url = `https://ipfs.infura.io/ipfs/${added.path}`;
			// after file is uploaded to ipfs pass the url to save it on polygon
			createSale(url);
		} catch (error) {
			console.log("error uploading file", error);
		}
	}

	async function createSale(url) {
		const { name, price, description } = formInput;
		const web3Modal = new Web3Modal();
		const connection = await web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(connection);

		const signer = provider.getSigner();
		let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
		let transaction = await contract.mintToken(url);
		let tx = await transaction.wait();
		let event = tx.events[0];
		let value = event.args[2];
		let tokenId = value.toNumber();

		const itemPrice = ethers.utils.parseUnits(price.toString(), "ether");

		contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);

		let listingPrice = await contract.getListingPrice();
		listingPrice = listingPrice.toString();

		transaction = await contract.createMarketItem(
			nftAddress,
			tokenId,
			itemPrice,
			{
				value: listingPrice,
			}
		);
		await transaction.wait();
		router.push("/");
	}

	return (
		<div className="flex justify-center">
			<div className="w-1/2 flex flex-col pb-12">
				<input
					placeholder="Asset Name"
					className="mt-8 border rounded p-4"
					onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
				/>
				<textarea
					placeholder="Asset Description"
					className="mt-8 border rounded p-4"
					onChange={(e) =>
						updateFormInput({ ...formInput, description: e.target.value })
					}
				/>
				<input
					placeholder="Asset Price in Matic"
					className="mt-8 border rounded p-4"
					onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
				/>
				<input type="file" name="Asset" className="my-4" onChange={onChange} />
				{fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
				<button
					className="font-bold mt-4 bg-sky-500/50 text-white rounded p-4 shadow-lg"
					onClick={createItem}
				>
					Create Digital Asset
				</button>
			</div>
		</div>
	);
}
