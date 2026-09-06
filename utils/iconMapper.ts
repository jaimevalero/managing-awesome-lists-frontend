/**
 * Icon mapper utility following Single Responsibility Principle
 * Maps category names to Material Design Icons
 */

// Icon mapping configuration - following Strategy Pattern
const CATEGORY_ICON_MAP: { [key: string]: string } = {
  // Programming Languages
  'python': 'mdi-language-python',
  'javascript': 'mdi-language-javascript',
  'js': 'mdi-language-javascript',
  'typescript': 'mdi-language-typescript',
  'java': 'mdi-language-java',
  'go': 'mdi-language-go',
  'golang': 'mdi-language-go',
  'rust': 'mdi-language-rust',
  'ruby': 'mdi-language-ruby',
  'php': 'mdi-language-php',
  'csharp': 'mdi-language-csharp',
  'cpp': 'mdi-language-cpp',
  'swift': 'mdi-language-swift',
  'kotlin': 'mdi-language-kotlin',
  
  // DevOps & Infrastructure
  'docker': 'mdi-docker',
  'kubernetes': 'mdi-kubernetes',
  'k8s': 'mdi-kubernetes',
  'terraform': 'mdi-terraform',
  'ansible': 'mdi-ansible',
  'jenkins': 'mdi-cog-sync-outline',
  'devops': 'mdi-cog-outline',
  'ci': 'mdi-sync',
  'cd': 'mdi-truck-delivery',
  'pipeline': 'mdi-pipe',
  
  // Cloud & Services
  'aws': 'mdi-aws',
  'azure': 'mdi-microsoft-azure',
  'gcp': 'mdi-google-cloud',
  'cloud': 'mdi-cloud',
  'serverless': 'mdi-cloud-outline',
  
  // Data & AI
  'machine-learning': 'mdi-brain',
  'ml': 'mdi-brain',
  'ai': 'mdi-robot',
  'data': 'mdi-database',
  'database': 'mdi-database',
  'sql': 'mdi-database',
  'mongodb': 'mdi-database',
  'postgres': 'mdi-database',
  'redis': 'mdi-database',
  'bigdata': 'mdi-database-arrow-right',
  'analytics': 'mdi-chart-line',
  
  // Web & Mobile
  'web': 'mdi-web',
  'frontend': 'mdi-monitor',
  'backend': 'mdi-server',
  'mobile': 'mdi-cellphone',
  'android': 'mdi-android',
  'ios': 'mdi-apple-ios',
  'react': 'mdi-react',
  'vue': 'mdi-vuejs',
  'angular': 'mdi-angular',
  'node': 'mdi-nodejs',
  
  // Security
  'security': 'mdi-shield-lock',
  'crypto': 'mdi-lock',
  'encryption': 'mdi-key',
  
  // Tools
  'testing': 'mdi-test-tube',
  'git': 'mdi-git',
  'github': 'mdi-github',
  'gitlab': 'mdi-gitlab',
  'vscode': 'mdi-microsoft-visual-studio-code',
  'vim': 'mdi-text-box-edit-outline',
  
  // Workflow & Automation
  'airflow': 'mdi-sitemap-outline',
  'apache': 'mdi-apache-kafka',
  'kafka': 'mdi-transit-connection-variant',
  'workflow': 'mdi-graph',
  'automation': 'mdi-robot-industrial',
  
  // UI/UX
  'ui': 'mdi-palette',
  'ux': 'mdi-account-heart',
  'design': 'mdi-palette',
  'css': 'mdi-language-css3',
  'bootstrap': 'mdi-bootstrap',
  
  // Actions & GitHub
  'actions': 'mdi-flash',
  'action': 'mdi-flash',
  
  // Android
  'android-ui': 'mdi-cellphone-cog',

  // Listas que caian en el icono generico: eran 42 de las 78, mas de la mitad
  'claude': 'mdi-robot-happy-outline',
  'claude-code': 'mdi-code-braces-box',
  'claude-code-subagents': 'mdi-account-group-outline',
  'claude-prompts': 'mdi-message-text-outline',
  'claude-skills': 'mdi-school-outline',
  'cli-apps': 'mdi-console',
  'compose': 'mdi-docker',
  'courses': 'mdi-school',
  'd3': 'mdi-chart-line',
  'db': 'mdi-database',
  'ddd': 'mdi-domain',
  'deep-learning': 'mdi-brain',
  'dotnet-core': 'mdi-dot-net',
  'flask': 'mdi-flask',
  'for-beginners': 'mdi-lightbulb-on-outline',
  'forensics': 'mdi-fingerprint',
  'free-for-dev': 'mdi-gift-outline',
  'groovy': 'mdi-code-braces',
  'hacking': 'mdi-shield-bug',
  'htaccess': 'mdi-file-cog-outline',
  'jquery-tips-everyone-should-know': 'mdi-language-javascript',
  'llm': 'mdi-robot-outline',
  'mac': 'mdi-apple',
  'malware-analysis': 'mdi-bug-outline',
  'mcp-servers': 'mdi-server-network',
  'microservices': 'mdi-hexagon-multiple-outline',
  'open-source-mac-os-apps': 'mdi-apple',
  'privacy': 'mdi-shield-lock-outline',
  'pytorch-list': 'mdi-fire',
  'quant': 'mdi-finance',
  'raspberry-pi': 'mdi-raspberry-pi',
  'readme': 'mdi-book-open-outline',
  'remote-job': 'mdi-briefcase-outline',
  'scala': 'mdi-code-braces',
  'selfhosted': 'mdi-server',
  'shell': 'mdi-console-line',
  'sysadmin': 'mdi-account-cog-outline',
  'terminals-are-sexy': 'mdi-console',
  'the-book-of-secret-knowledge': 'mdi-book-lock-outline',
  'wpo': 'mdi-speedometer',
  'zsh-plugins': 'mdi-console-line',

  // Estos seis se quedaban sin icono al dejar de casar por subcadena: antes
  // acertaban por accidente o directamente fallaban ('linux' salia con un
  // corazon porque contiene 'ux'). 'apache-airflow' va explicito porque si no
  // gana la palabra 'apache' y sale el icono de Kafka.
  'linux': 'mdi-linux',
  'nodejs': 'mdi-nodejs',
  'mysql': 'mdi-database',
  'datascience': 'mdi-chart-scatter-plot',
  'blockchain': 'mdi-link-variant',
  'apache-airflow': 'mdi-sitemap-outline',
  'dataviz': 'mdi-chart-box-outline'
}

/**
 * Get icon for a category name
 * Following Fail-Safe pattern with default icon
 * 
 * @param categoryName - Category name to map
 * @returns Material Design Icon name
 */
export function getCategoryIcon(categoryName: string): string {
  if (!categoryName) {
    return 'mdi-file-document-outline'
  }

  // El nombre llega ya formateado para mostrar ("claude code", "apache
  // airflow"), asi que hay que devolverlo a la forma con guiones o las claves
  // compuestas no casan nunca: "claude code" salia con el icono generico de
  // claude y "apache airflow" con el de Kafka.
  const lowerName = categoryName.toLowerCase().trim().replace(/[\s_]+/g, '-')

  // Direct match - O(1) lookup
  if (CATEGORY_ICON_MAP[lowerName]) {
    return CATEGORY_ICON_MAP[lowerName]
  }

  // Aqui llega el nombre completo del repo ("jghoman/awesome-apache-airflow"),
  // asi que hay que quedarse con el tema: sin el dueño y sin el "awesome-".
  // Sin esto gana la primera palabra suelta que este en el mapa, y airflow
  // salia con el icono de Kafka porque "apache" va antes, y claude-code con el
  // de claude a secas.
  const tema = (lowerName.split('/').pop() || '').replace(/^awesome[-_]?/, '')
  if (CATEGORY_ICON_MAP[tema]) {
    return CATEGORY_ICON_MAP[tema]
  }

  // Match por palabras, no por subcadena. Buscando dentro de la cadena entera,
  // las claves de dos letras casan con cualquier cosa: "apache-airflow" y
  // "blockchain" contienen "ai" y salian con un robot, "linux" contiene "ux" y
  // salia con un corazon, "datascience" contiene "ci" y salia con un icono de
  // sincronizar.
  const words = tema.split(/[^a-z0-9]+/).filter(Boolean)
  for (const word of words) {
    if (CATEGORY_ICON_MAP[word]) {
      return CATEGORY_ICON_MAP[word]
    }
  }

  // Ya como ultimo recurso, subcadena, pero solo con claves largas: "kubernetes"
  // dentro de "kubernetes-tools" es una pista real, "go" dentro de "django" no.
  for (const [keyword, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (keyword.length >= 5 && lowerName.includes(keyword)) {
      return icon
    }
  }

  // Default icon - fail-safe pattern
  return 'mdi-file-document-outline'
}

/**
 * Get display name from category
 * Remove 'awesome-' prefix and format
 */
export function formatCategoryName(display: string): string {
  if (!display) return ''
  return display
    .replace('awesome-', '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
}
