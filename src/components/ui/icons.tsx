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
 * Ícono artesanal de Alfiler de Gancho (Safety Pin)
 * Inspirado en el Key Visual de Mer Kilmurray
 */
export function SafetyPinIcon({
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
      aria-label="Alfiler de gancho Mer Kilmurray"
    >
      <g transform="rotate(-30 50 50)">
        {/* Halo / Contorno rosa empolvado (#E2A6BA) estilo sticker */}
        {withHalo && (
          <path
            d="M 33 22 
               C 33 8, 67 8, 67 22 
               L 67 78 
               C 67 92, 33 92, 33 78 
               Z"
            fill="#E2A6BA"
            fillOpacity="0.45"
            stroke="#E2A6BA"
            strokeWidth="6"
            strokeLinejoin="round"
          />
        )}

        {/* Alambre y Resorte inferior (borravino #631E2E) */}
        <path
          d="M 43 35 
             L 43 75 
             A 7 7 0 1 0 57 75 
             L 57 35"
          stroke="#631E2E"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ojo del resorte interior */}
        <circle
          cx="50"
          cy="77"
          r="3"
          stroke="#631E2E"
          strokeWidth="2.5"
          fill="#FBF4E8"
        />

        {/* Capuchón / Cierre superior del alfiler (#631E2E) */}
        <path
          d="M 39 37 
             L 39 22 
             C 39 12, 61 12, 61 22 
             L 61 37 
             C 57 37, 54 34, 52 28 
             C 50 22, 44 24, 44 30 
             C 44 34, 42 37, 39 37 
             Z"
          fill="#631E2E"
          stroke="#631E2E"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Pequeña hendidura / brillo del capuchón */}
        <path
          d="M 45 20 C 47 16, 53 16, 55 20"
          stroke="#FBF4E8"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
      </g>
    </svg>
  );
}
