import NavbarComponent from "../components/NavbarComponent";

type AuthInputProps = {
	id: string;
	name: string;
	type?: "email" | "password" | "text";
	label: string;
	placeholder: string;
	autoComplete?: string;
	required?: boolean;
};

function AuthInput({
	id,
	name,
	type = "text",
	label,
	placeholder,
	autoComplete,
	required = true,
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
			/>
		</div>
	);
}

export default function RegisterPage() {
	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-sans">
			<NavbarComponent />

			<main className="flex flex-1 items-center justify-center px-4 pt-24 pb-10">
				<section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 shadow-[0_0_40px_rgba(236,72,153,0.12)] backdrop-blur-sm">
					<div className="mb-7 text-center">
						<h1 className="text-3xl font-bold tracking-tight text-white">Register</h1>
						<p className="mt-2 text-sm text-zinc-400">Start Saving Hours Today.</p>
					</div>

					<form className="flex flex-col gap-5">
						<AuthInput
							id="email"
							name="email"
							type="email"
							label="Email"
							placeholder="you@example.com"
							autoComplete="email"
						/>

						<AuthInput
							id="password"
							name="password"
							type="password"
							label="Password"
							placeholder="Create a strong password"
							autoComplete="new-password"
						/>

						<AuthInput
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							label="Confirm password"
							placeholder="Re-enter your password"
							autoComplete="new-password"
						/>

						<button
							type="submit"
							className="mt-2 rounded-xl bg-linear-to-r from-pink-500 to-red-500
                             px-4 py-3 font-semibold text-white transition hover:from-pink-400 hover:to-red-400 focus:outline-none focus:ring-2
                            focus:ring-pink-500/40 hover:cursor-pointer"
						>
							Create account
						</button>
					</form>
				</section>
			</main>
		</div>
	);
}
