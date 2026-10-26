export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/**
 * Ícono artesanal de Tijera — estilo dibujo a mano
 * Inspirado en el Key Visual de Mer Kilmurray
 * Colores: borravino #631E2E, halo rosa #E2A6BA, crema #FBF4E8
 */
export function ScissorsIcon({
  className = "h-9 w-9",
  withHalo = true,
}: {
  className?: string;
  withHalo?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tijera Mer Kilmurray"
    >
      {/* Rotación: -28° para dar el efecto torcido artesanal */}
      <g transform="rotate(-28 50 50)">

        {/* Halo suave estilo sticker — círculo irregular hecho a mano */}
        {withHalo && (
          <ellipse
            cx="50" cy="52"
            rx="36" ry="38"
            fill="#E2A6BA"
            fillOpacity="0.35"
            stroke="#E2A6BA"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        )}

        {/* === HOJA SUPERIOR === */}
        {/* Cuerpo de la hoja — forma orgánica, no perfectamente simétrica */}
        <path
          d="M 38 46
             C 34 38, 28 30, 28 22
             C 28 14, 36 10, 43 14
             C 50 18, 50 28, 48 38
             Z"
          fill="#631E2E"
          stroke="#631E2E"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Nervadura / línea interior de la hoja superior */}
        <path
          d="M 41 44 C 38 36, 33 26, 34 16"
          stroke="#47131F"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* === HOJA INFERIOR === */}
        <path
          d="M 62 46
             C 66 38, 72 30, 72 22
             C 72 14, 64 10, 57 14
             C 50 18, 50 28, 52 38
             Z"
          fill="#631E2E"
          stroke="#631E2E"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Nervadura / línea interior de la hoja inferior */}
        <path
          d="M 59 44 C 62 36, 67 26, 66 16"
          stroke="#47131F"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* === TORNILLO CENTRAL === */}
        <circle
          cx="50" cy="47"
          r="4.5"
          fill="#FBF4E8"
          stroke="#631E2E"
          strokeWidth="2"
        />
        {/* Brillo del tornillo */}
        <circle
          cx="51.5" cy="45.5"
          r="1.2"
          fill="#E2A6BA"
          opacity="0.8"
        />

        {/* === MANGO IZQUIERDO === */}
        <path
          d="M 37 48
             C 30 50, 18 52, 14 60
             C 10 68, 16 78, 25 78
             C 34 78, 40 70, 42 63
             C 44 56, 42 50, 38 48
             Z"
          fill="#631E2E"
          stroke="#631E2E"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Ojal izquierdo (agujero del mango) */}
        <ellipse
          cx="24" cy="68"
          rx="8" ry="7"
          fill="#FBF4E8"
          stroke="#47131F"
          strokeWidth="1.5"
        />

        {/* === MANGO DERECHO === */}
        <path
          d="M 63 48
             C 70 50, 82 52, 86 60
             C 90 68, 84 78, 75 78
             C 66 78, 60 70, 58 63
             C 56 56, 58 50, 62 48
             Z"
          fill="#631E2E"
          stroke="#631E2E"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Ojal derecho (agujero del mango) */}
        <ellipse
          cx="76" cy="68"
          rx="8" ry="7"
          fill="#FBF4E8"
          stroke="#47131F"
          strokeWidth="1.5"
        />

        {/* Pequeños trazos irregulares para dar efecto "dibujado a mano" */}
        <path
          d="M 30 20 C 30.5 19.5, 31 19.8, 30.8 20.5"
          stroke="#631E2E"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 70 20 C 69.5 19.5, 69 19.8, 69.2 20.5"
          stroke="#631E2E"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

/** @deprecated Usar ScissorsIcon */
export function SafetyPinIcon(props: { className?: string; withHalo?: boolean }) {
  return <ScissorsIcon {...props} />;
}
