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
  'jenkins': 'mdi-jenkins',
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
  'vim': 'mdi-vim',
  
  // Workflow & Automation
  'airflow': 'mdi-airflow',
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
  'android-ui': 'mdi-cellphone-cog'
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

  const lowerName = categoryName.toLowerCase()
  
  // Direct match - O(1) lookup
  if (CATEGORY_ICON_MAP[lowerName]) {
    return CATEGORY_ICON_MAP[lowerName]
  }
  
  // Partial match - search for keywords
  for (const [keyword, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (lowerName.includes(keyword)) {
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
