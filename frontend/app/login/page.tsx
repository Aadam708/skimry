

"use client";

import { useState, type ChangeEvent, type SubmitEvent } from "react";
import NavbarComponent from "../components/NavbarComponent";
import { useRouter } from "next/navigation";

type AuthInputProps = {
	id: string;
	name: string;
	type?: "email" | "password" | "text";
	label: string;
	placeholder: string;
	autoComplete?: string;
	required?: boolean;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function AuthInput({
	id,
	name,
	type = "text",
	label,
	placeholder,
	autoComplete,
	required = true,
	onChange,
}: AuthInputProps) {
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm font-medium text-zinc-200">
				{label}
			</label>
			<input
				id={id}
				name={name}
				type={type}
				placeholder={placeholder}
				autoComplete={autoComplete}
				required={required}
				className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30"
				onChange={onChange}
			/>
		</div>
	);
}

export default function LoginPage() {

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const res = await fetch("http://localhost:8080/api/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				email,
				password,
			}),
		});

		if (!res.ok) {
			console.error("Login failed", await res.text());
			return;
		}

		router.push("dashboard");

	};

	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-sans">
			<NavbarComponent />

			<main className="flex flex-col flex-1  items-center justify-center px-4 pt-24 pb-10">
				<section className="flex flex-col w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/70 gap-6 p-8 shadow-[0_0_40px_rgba(236,72,153,0.12)] backdrop-blur-sm">
					<div className="flex flex-col gap-1.5 text-center">
						<h1 className="text-3xl font-bold tracking-tight text-white">Login</h1>
						<p className="max-w-sm text-sm text-zinc-400 text-balance">Ready to skim? Your saved summaries are waiting.</p>
					</div>

					<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
						<AuthInput
							id="email"
							name="email"
							type="email"
							label="Email"
							placeholder="you@example.com"
							autoComplete="email"
							onChange={(e) => setEmail(e.target.value)}
						/>

						<AuthInput
							id="password"
							name="password"
							type="password"
							label="Password"
							placeholder="Enter your password"
							autoComplete="current-password"
							onChange={(e) => setPassword(e.target.value)}
						/>

						<button
							type="submit"
							className=" rounded-xl bg-linear-to-r from-pink-500 to-red-500
                             px-4 py-3 font-semibold text-white transition hover:from-pink-400 hover:to-red-400 focus:outline-none focus:ring-2
                            focus:ring-pink-500/40 hover:cursor-pointer"
						>
							Login
						</button>
					</form>
				</section>
			</main>
		</div>
	);
}
