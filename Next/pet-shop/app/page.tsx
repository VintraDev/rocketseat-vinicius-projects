export default function Home() {
  return (
    <div className="bg-background-primary p-6">
      <div className="flex items-center justify-between md:m-8">
        <div>
          <h1 className="text-title-size text-content-primary mb-2">
            Sua Agenda
          </h1>
          <p className="text-paragraph-medium-size text-content-secondary">
            Aqui você pode ver todos os seus clientes e serviços agendados para
            hoje.
          </p>
        </div>
      </div>
    </div>
  );
}
