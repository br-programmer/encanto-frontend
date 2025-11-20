export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header con paleta Encanto */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl text-foreground">
            Encanto
          </h1>
          <p className="text-xl text-foreground-secondary">
            Joyería & Detalles Personalizados
          </p>
        </div>

        {/* Cards de demostración de colores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Primary (Marrón) */}
          <div className="bg-warm-white border-2 border-primary rounded-lg p-6 space-y-4">
            <h2 className="text-2xl text-primary">Color Primario</h2>
            <p className="text-foreground-secondary">
              Este es el color marrón principal de Encanto (#aa9083)
            </p>
            <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg transition-colors">
              Botón Primario
            </button>
          </div>

          {/* Card Secondary (Rosa Pastel) */}
          <div className="bg-secondary border-2 border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl text-foreground">Color Secundario</h2>
            <p className="text-foreground-secondary">
              Este es el color rosa pastel (#f2d0c5)
            </p>
            <button className="bg-secondary hover:bg-accent text-foreground px-6 py-3 rounded-lg border-2 border-border transition-colors">
              Botón Secundario
            </button>
          </div>

          {/* Card Logo Colors */}
          <div className="bg-background-alt border-2 border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl text-logo-primary">Color Logo</h2>
            <p className="text-foreground-secondary">
              Rosa malva para el logotipo (#B07B8F)
            </p>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-logo-primary rounded-lg"></div>
              <div className="w-16 h-16 bg-logo-gold rounded-lg"></div>
            </div>
          </div>

          {/* Card con efecto glow */}
          <div className="bg-warm-white border-2 border-border rounded-lg p-6 space-y-4 glow-effect cursor-pointer">
            <h2 className="text-2xl text-foreground">Efecto Glow</h2>
            <p className="text-foreground-secondary">
              Pasa el mouse por encima para ver el efecto
            </p>
            <div className="text-sm text-foreground-muted">
              Hover me! 🌟
            </div>
          </div>
        </div>

        {/* Paleta completa */}
        <div className="bg-warm-white border-2 border-border rounded-lg p-6 space-y-4">
          <h3 className="text-2xl text-foreground">Paleta de Colores Completa</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-20 bg-primary rounded-lg"></div>
              <p className="text-sm text-foreground-secondary">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-secondary rounded-lg"></div>
              <p className="text-sm text-foreground-secondary">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-accent rounded-lg"></div>
              <p className="text-sm text-foreground-secondary">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-background-alt rounded-lg"></div>
              <p className="text-sm text-foreground-secondary">Background Alt</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-destructive rounded-lg"></div>
              <p className="text-sm text-foreground-secondary">Destructive</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-success rounded-lg"></div>
              <p className="text-sm text-foreground-secondary">Success</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-logo-primary rounded-lg"></div>
              <p className="text-sm text-foreground-secondary">Logo Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-logo-gold rounded-lg"></div>
              <p className="text-sm text-foreground-secondary">Logo Gold</p>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-success text-white px-6 py-3 rounded-lg">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">Tailwind CSS 4 funcionando correctamente!</span>
          </div>
          <p className="text-foreground-secondary">
            Frontend de Encanto con paleta rosa pastel
          </p>
        </div>
      </div>
    </div>
  );
}
