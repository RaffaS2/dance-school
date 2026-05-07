"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBase } from "../../lib/apiBase";

type ApiCategory = {
	id_category: number;
	name: string;
};

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

async function getApiErrorMessage(response: Response, fallback: string) {
	try {
		const data = (await response.json()) as { error?: string; message?: string };
		return data.error || data.message || fallback;
	} catch {
		return fallback;
	}
}

export default function AddItemPage() {
	const apiBase = getApiBase();
	const router = useRouter();

	const [novoNome, setNovoNome] = useState("");
	const [novaCategoria, setNovaCategoria] = useState("");
	const [novaImagem, setNovaImagem] = useState<File | null>(null);
	const [previewImagem, setPreviewImagem] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] ?? null;
		setNovaImagem(file);
		if (file) {
			setPreviewImagem(URL.createObjectURL(file));
		} else {
			setPreviewImagem(null);
		}
	}

	async function garantirCategoria(categoriaNome: string) {
		const res = await fetch(`${apiBase}/categories`, { credentials: "include" });
		if (res.ok) {
			const categorias = (await res.json()) as ApiCategory[];
			const existente = categorias.find(
				(c) => c.name.toLowerCase() === categoriaNome.toLowerCase(),
			);
			if (existente) return existente.id_category;
		}

		const createRes = await fetch(`${apiBase}/categories`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ name: categoriaNome }),
		});

		if (!createRes.ok) {
			throw new Error(await getApiErrorMessage(createRes, "Não foi possível criar categoria"));
		}
		const category = (await createRes.json()) as ApiCategory;
		return category.id_category;
	}

	async function adicionarNovoItem(evento: FormEvent<HTMLFormElement>) {
		evento.preventDefault();
		if (!novoNome.trim() || !novaCategoria.trim()) return;

		setSubmitting(true);
		try {
			const idCategoria = await garantirCategoria(novaCategoria.trim());

			let imageUrl: string | null = null;
			if (novaImagem) {
				imageUrl = await fileToBase64(novaImagem);
			}

			const res = await fetch(`${apiBase}/items`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					name: novoNome.trim(),
					status: 1,
					id_category: idCategoria,
					image_url: imageUrl,
				}),
			});

			if (!res.ok) {
				throw new Error(await getApiErrorMessage(res, "Falha ao criar item"));
			}

			router.push("/inventario");
		} catch (error) {
			alert(error instanceof Error ? error.message : "Não foi possível guardar o item.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="min-h-screen bg-gray-100 text-zinc-900">
			<div className="mx-auto w-full max-w-xl px-6 pt-8 pb-12">
				{/* Header */}
				<div className="mb-6 flex items-center gap-3">
					<Link
						href="/inventario"
						className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
					</Link>
					<div>
						<h1 className="text-xl font-semibold">Adicionar Novo Item</h1>
						<p className="text-sm text-gray-500">Preenche os dados do item a adicionar ao inventário.</p>
					</div>
				</div>

				{/* Formulário */}
				<form onSubmit={adicionarNovoItem} className="rounded-xl bg-white p-6 shadow space-y-5">
					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700">
							Nome do item <span className="text-rose-500">*</span>
						</label>
						<input
							value={novoNome}
							onChange={(e) => setNovoNome(e.target.value)}
							placeholder="Ex: Tapete de Yoga"
							required
							className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700">
							Categoria <span className="text-rose-500">*</span>
						</label>
						<input
							value={novaCategoria}
							onChange={(e) => setNovaCategoria(e.target.value)}
							placeholder="Ex: Material Didático"
							required
							className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300"
						/>
						<p className="mt-1 text-xs text-gray-400">Se a categoria não existir, será criada automaticamente.</p>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-700">
							Imagem (opcional)
						</label>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:text-gray-600"
						/>
						{previewImagem && (
							<div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
								<img src={previewImagem} alt="Preview" className="h-40 w-full object-cover" />
							</div>
						)}
					</div>

					<div className="flex gap-3 pt-2">
						<Link
							href="/inventario"
							className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancelar
						</Link>
						<button
							type="submit"
							disabled={submitting || !novoNome.trim() || !novaCategoria.trim()}
							className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors"
						>
							{submitting ? "A guardar..." : "Guardar Item"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
