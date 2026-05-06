export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-md max-w-md text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido enviado!</h1>
        <p className="text-gray-500 mb-4">
          O teu pedido de registo como <strong>Professor</strong> foi enviado à coordenação da EntArtes.
        </p>
        <p className="text-gray-500">
          Receberás um email assim que a tua conta for aprovada. Pode demorar até 48 horas.
        </p>
        <a
          href="/login"
          className="inline-block mt-6 text-sm text-indigo-600 hover:underline"
        >
          Voltar ao login
        </a>
      </div>
    </div>
  )
}
