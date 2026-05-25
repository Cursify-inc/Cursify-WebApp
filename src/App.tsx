import React from 'react'

// Helper component to colorize external SVGs automatically based on text color
const Icon = ({ src, className }: { src: string; className?: string }) => (
  <span
    className={`inline-block bg-current ${className}`}
    style={{
      maskImage: `url(${src})`,
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskImage: `url(${src})`,
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
    }}
  />
)

const App: React.FC = () => {
  return (
    <>
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src="https://lh3.googleusercontent.com/aida/ADBb0ujtvuHT_TPnAjvPodQysQHQaCKIlwbM3dcJYJTU5WSaf2NDJhTmIWsnWxtQvXTiJZfHzZlZp3EP_TjA7eVWSJ6rjjabs2zjHdEozM109qqWkHObt0P7n9YjD5-zuBC92fmYmvn-PoXYaWp9gJxyZ9qkCxx2qePKsEeY5TKELbST7J4pPTAUAj0j6uQUeeivxgrTP1s96-5n6dXgbdJhPQlE5KzBZJH_5xADPh32nEfgAM8piZQQucUaPw"
            alt="Cursify Logo"
            className="h-8 w-8 rounded-DEFAULT object-cover"
          />
          <span className="font-headline-md text-headline-md font-bold text-primary">
            Cursify
          </span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a
            href="#ecosystem"
            className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1"
          >
            Ecosystem
          </a>
          <a
            href="#features"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#security"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            Security
          </a>
          <a
            href="#pricing"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:block font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300">
            Sign In
          </button>
          <button className="bg-primary-container text-on-primary rounded-lg px-6 py-2 font-label-sm text-label-sm hover:bg-[#3A4B6B] transition-colors duration-300 shadow-sm">
            Get Started
          </button>
        </div>
      </nav>

      <main className="pt-[80px] bg-background text-on-surface font-body-md antialiased overflow-x-hidden selection:bg-secondary-container selection:text-on-surface">
        {/* 1. Hero */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-24 overflow-hidden">
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, #5E7194 0%, transparent 40%), radial-gradient(circle at 80% 70%, #24314A 0%, transparent 40%)',
              mixBlendMode: 'multiply',
            }}
          />
          <div className="relative z-10 max-w-container-max mx-auto text-center">
            <h1 className="font-headline-xl text-headline-xl text-primary mb-6 max-w-4xl mx-auto">
              Engineering the Future of <br />
              <span className="text-gradient">Intelligent Development</span>.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              A seamlessly integrated ecosystem connecting a powerful web
              account with a synced, AI-augmented desktop IDE. Elevate your
              workflow with modular intelligence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button className="w-full sm:w-auto bg-primary-container text-on-primary rounded-lg px-8 py-3 font-label-sm text-label-sm hover:bg-[#3A4B6B] transition-colors duration-300 shadow-[0_4px_14px_0_rgba(36,49,74,0.39)] flex items-center justify-center gap-2">
                <Icon src="/icons/download_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-5 h-5" />
                Download for Desktop
              </button>
              <button className="w-full sm:w-auto border border-outline-variant bg-surface-container-lowest text-on-surface rounded-lg px-8 py-3 font-label-sm text-label-sm hover:bg-surface-container-low hover:border-outline transition-all duration-300">
                Explore Ecosystem
              </button>
            </div>
          </div>
        </section>

        {/* 2. Ecosystem Overview */}
        <section
          id="ecosystem"
          className="py-24 px-margin-mobile md:px-margin-desktop bg-surface"
        >
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
                A Unified Development Ecosystem
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Web account management, subscription billing, and a native desktop
                IDE—all perfectly synced.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  iconSrc: '/icons/cloud_sync_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg',
                  title: 'Web Account',
                  text: 'Manage your settings, billing, and team access from a secure web portal.',
                  active: false,
                },
                {
                  iconSrc: '/icons/desktop_windows_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg',
                  title: 'Desktop IDE',
                  text: 'A native, high-performance editor that syncs your remote context instantly.',
                  active: true,
                },
                {
                  iconSrc: '/icons/smart_toy_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg',
                  title: 'AI Ecosystem',
                  text: 'Extend your workflow with modular agents and custom tool integrations.',
                  active: false,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`glass-panel p-8 rounded-xl text-center flex flex-col items-center hover-glow relative overflow-hidden ${
                    card.active
                      ? 'border-primary/30 shadow-[0_8px_24px_rgba(36,49,74,0.15)]'
                      : ''
                  }`}
                >
                  <div
                    className={`glow-line ${
                      card.active
                        ? 'opacity-100 bg-primary'
                        : ''
                    }`}
                  />
                  <Icon src={card.iconSrc} className="w-10 h-10 mb-4 text-primary" />
                  <h3 className="font-headline-md text-headline-md text-primary mb-2">
                    {card.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. IDE Preview */}
        <section
          id="features"
          className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low"
        >
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
                The Intelligent Canvas
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Experience a frictionless development environment where your
                settings, agents, and context sync perfectly between web and
                desktop.
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden glass-panel border border-outline-variant/50 p-2 bg-surface-container-lowest shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-surface-tint/5 to-transparent pointer-events-none" />
              <img
                src="https://lh3.googleusercontent.com/aida/ADBb0uhjtiRogAY-vlhG-Gt1p6fzJAqY6t8dWyvJQqvPXrZooI0ojU-ufJgH2CRnSOHSROPGszJNBIZfjgeZO0OYGaQ0RGxubbOPu_PoLI7MDct_fEWhYsIQgkPXb8e0xpF6WA-5njzcK83PtSA0WbhcfxLxLbR_epXdODgu49gfzQKcNNY0UUlB-GE8BkS4OfAVr-0_ghWhUpqcEm4Bj8suChyrxBxRLUSZu-bhgZYPeRkDnApuSCls-t2bor8"
                alt="Cursify IDE Mockup"
                className="w-full h-auto rounded-lg shadow-sm border border-outline-variant/20 block"
              />
              {/* faux header */}
              <div className="absolute top-2 left-2 right-2 h-8 bg-inverse-surface/90 backdrop-blur-md rounded-t-lg border-b border-outline-variant/30 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-error/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-surface-tint/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary-fixed/80" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Secure Pairing */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
                Secure Device Pairing
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
                Connect your desktop IDE to your web account securely. Trust
                your devices, manage sessions remotely, and ensure your code
                context remains encrypted and synchronized.
              </p>
              <ul className="flex flex-col gap-4 font-body-md text-body-md text-on-surface-variant">
                {[
                  { iconSrc: '/icons/verified_user_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg', text: 'End-to-end encrypted context sync' },
                  { iconSrc: '/icons/devices_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg', text: 'Manage trusted devices from the web' },
                  { iconSrc: '/icons/lock_clock_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg', text: 'Remote session revocation' },
                ].map((li, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Icon src={li.iconSrc} className="w-6 h-6 text-primary" />
                    {li.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-panel p-8 rounded-xl flex flex-col gap-6 relative">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div className="flex items-center gap-3">
                  <Icon src="/icons/laptop_mac_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-8 h-8 text-on-surface" />
                  <div>
                    <p className="font-headline-sm text-on-surface font-bold">
                      MacBook Pro (M3)
                    </p>
                    <p className="font-label-sm text-on-surface-variant">
                      Last synced: Just now
                    </p>
                  </div>
                </div>
                <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-label-sm">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon src="/icons/computer_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-8 h-8 opacity-60 text-on-surface" />
                  <div>
                    <p className="font-headline-sm text-on-surface">
                      Studio Desktop
                    </p>
                    <p className="font-label-sm text-on-surface-variant">
                      Last synced: 2 hours ago
                    </p>
                  </div>
                </div>
                <button className="text-error font-label-sm hover:underline">
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Agents & Extensions */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Modular Intelligence
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-16">
              Customize your workflow with installable AI agents and developer
              tools tailored to your stack.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  iconBg: 'bg-primary-container',
                  iconColor: 'text-on-primary-container',
                  iconSrc: '/icons/code_blocks_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg',
                  title: 'React Refactor',
                  desc: 'Specialized agent for modernizing React components and hooks.',
                },
                {
                  iconBg: 'bg-surface-tint',
                  iconColor: 'text-on-primary',
                  iconSrc: '/icons/bug_report_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg',
                  title: 'Test Gen AI',
                  desc: 'Automatically generate unit tests for TypeScript and Python.',
                },
                {
                  iconBg: 'bg-secondary',
                  iconColor: 'text-on-secondary',
                  iconSrc: '/icons/api_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg',
                  title: 'API Architect',
                  desc: 'Assists in designing and validating REST and GraphQL APIs.',
                },
                {
                  iconBg: 'bg-transparent',
                  iconColor: 'text-on-surface-variant',
                  iconSrc: '/icons/add_circle_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg',
                  title: 'Marketplace',
                  desc: 'Explore 100+ tools',
                  dashed: true,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`glass-panel p-6 rounded-xl text-left hover:shadow-lg transition-shadow ${
                    card.dashed ? 'border-dashed border-2 border-outline-variant/50 bg-transparent shadow-none flex flex-col justify-center items-center text-center' : ''
                  }`}
                >
                  <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon src={card.iconSrc} className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h4 className="font-headline-sm font-bold text-on-surface mb-2">
                    {card.title}
                  </h4>
                  <p className="font-body-sm text-on-surface-variant mb-4">
                    {card.desc}
                  </p>
                  {!card.dashed && (
                    <button className="text-primary font-label-sm font-bold hover:underline">
                      Install
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Integrations */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Seamless Integrations
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
              Connect your existing workflow tools for uninterrupted context
              switching.
            </p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
              {[
                { iconSrc: '/icons/deployed_code_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg', name: 'GitHub' },
                { iconSrc: '/icons/integration_instructions_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg', name: 'GitLab' },
                { iconSrc: '/icons/groups_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg', name: 'Slack' },
                { iconSrc: '/icons/category_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg', name: 'Jira' },
                { iconSrc: '/icons/public_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg', name: 'AWS' },
              ].map((svc, i) => (
                <div key={i} className="flex items-center gap-2 font-headline-md font-bold text-on-surface">
                  <Icon src={svc.iconSrc} className="w-8 h-8 text-on-surface-variant" />
                  {svc.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Security */}
        <section id="security" className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
                <Icon src="/icons/security_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
                Enterprise-Grade Security
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
                We treat your source code as highly classified. Cursify is built
                on zero-trust principles, with signed binaries and full
                transparency over AI context sharing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Icon src="/icons/check_circle_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-6 h-6 mt-1 text-primary" />
                  <div>
                    <h4 className="font-headline-sm font-bold text-on-surface">
                      Signed Downloads
                    </h4>
                    <p className="font-body-sm text-on-surface-variant">
                      Verified binaries for Mac, Windows, and Linux.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Icon src="/icons/check_circle_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-6 h-6 mt-1 text-primary" />
                  <div>
                    <h4 className="font-headline-sm font-bold text-on-surface">
                      Data Privacy
                    </h4>
                    <p className="font-body-sm text-on-surface-variant">
                      Your code is never used to train public models.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md glass-panel p-8 rounded-xl">
              <h3 className="font-headline-md font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">
                Security Center
              </h3>
              <div className="flex justify-between items-center mb-4">
                <span className="font-body-md text-on-surface">
                  Two-Factor Authentication
                </span>
                <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold">
                  Action Required
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-body-md text-on-surface">Active Sessions</span>
                <span className="text-on-surface-variant text-sm">2 Devices</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-on-surface">Telemetry Data</span>
                <span className="text-primary font-label-sm font-bold hover:underline cursor-pointer">
                  Manage
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Pricing */}
        <section id="pricing" className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-16">
              Start for free, scale when you need more power.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              {/* Community */}
              <div className="glass-panel p-8 rounded-xl flex flex-col">
                <h3 className="font-headline-md font-bold text-on-surface mb-2">
                  Community
                </h3>
                <div className="mb-6">
                  <span className="font-headline-xl text-primary">$0</span>
                  <span className="text-on-surface-variant">/month</span>
                </div>
                <ul className="flex flex-col gap-3 font-body-sm text-on-surface-variant mb-8 flex-grow">
                  {['Core Desktop IDE','Basic AI Autocomplete','1 Synced Device'].map((f,i)=><li key={i} className="flex items-center gap-2"><Icon src="/icons/check_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-4 h-4 text-primary" />{f}</li>)}
                  <li className="flex items-center gap-2">
                    <Icon src="/icons/close_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-4 h-4 opacity-50 text-on-surface-variant" />
                    Custom Agents
                  </li>
                </ul>
                <button className="w-full border border-outline-variant bg-surface-container-lowest text-on-surface rounded-lg py-2 font-label-sm hover:bg-surface-container-low transition-colors">
                  Get Started
                </button>
              </div>
              {/* Professional */}
              <div className="glass-panel p-8 rounded-xl flex flex-col border-primary shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-on-primary px-4 py-1 rounded-bl-lg font-label-sm text-xs">
                  Popular
                </div>
                <h3 className="font-headline-md font-bold text-on-surface mb-2">
                  Professional
                </h3>
                <div className="mb-6">
                  <span className="font-headline-xl text-primary">$20</span>
                  <span className="text-on-surface-variant">/month</span>
                </div>
                <ul className="flex flex-col gap-3 font-body-sm text-on-surface-variant mb-8 flex-grow">
                  {[
                    'Everything in Community',
                    'Advanced AI Chat & Agents',
                    'Unlimited Devices',
                    'Priority Support',
                  ].map((f,i)=>(
                    <li key={i} className="flex items-center gap-2">
                      <Icon src="/icons/check_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-4 h-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-primary-container text-on-primary rounded-lg py-2 font-label-sm hover:bg-[#3A4B6B] transition-colors shadow-sm">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq" className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low">
          <div className="max-w-container-max mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                {
                  q: 'What operating systems are supported?',
                  a: 'The Cursify Desktop IDE is available for macOS (Intel & Apple Silicon), Windows 10/11, and major Linux distributions (Ubuntu, Debian, Fedora).',
                  open: true,
                },
                {
                  q: 'Do I need an internet connection to use the IDE?',
                  a: 'Core editing features work fully offline. However, advanced AI features, account syncing, and agent interactions require an active internet connection.',
                },
                {
                  q: 'How is my code used for AI features?',
                  a: 'Code context is only sent securely to provide immediate suggestions and answers. We do not use user code to train foundational models. See our Security page for detailed telemetry controls.',
                },
              ].map((item,i)=>(
                <details key={i} className="glass-panel rounded-lg p-6 group cursor-pointer" open={item.open}>
                  <summary className="font-headline-sm font-bold text-on-surface flex justify-between items-center list-none">
                    {item.q}
                    <Icon src="/icons/arrow_drop_down_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-6 h-6 transition-transform group-open:rotate-180 text-on-surface" />
                  </summary>
                  <p className="font-body-md text-on-surface-variant mt-4">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Final CTA */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop bg-primary text-on-primary text-center">
          <div className="max-w-container-max mx-auto max-w-3xl">
            <h2 className="font-headline-lg text-headline-lg mb-6">
              Ready to Upgrade Your Workflow?
            </h2>
            <p className="font-body-lg text-primary-fixed-dim mb-10">
              Join thousands of developers experiencing the next generation of
              intelligent IDEs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button className="w-full sm:w-auto bg-surface text-primary rounded-lg px-8 py-3 font-label-sm text-label-sm hover:bg-surface-dim transition-colors shadow-lg font-bold">
                Create Free Account
              </button>
              <button className="w-full sm:w-auto border border-primary-fixed-dim text-on-primary rounded-lg px-8 py-3 font-label-sm text-label-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                <Icon src="/icons/download_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-5 h-5 text-on-primary" />
                Download Mac (Apple Silicon)
              </button>
            </div>
            <p className="mt-6 text-sm text-primary-fixed-dim">
              Also available for{' '}
              <a className="underline hover:text-on-primary" href="#">
                Windows
              </a>{' '}
              and{' '}
              <a className="underline hover:text-on-primary" href="#">
                Linux
              </a>
              .
            </p>
          </div>
        </section>

        {/* 11. Footer */}
        <footer className="bg-surface-container-lowest border-t border-outline-variant/20 w-full py-16 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
            <div className="flex flex-col gap-4 col-span-1">
              <div className="flex items-center gap-2">
                <img
                  src="https://lh3.googleusercontent.com/aida/ADBb0ujtvuHT_TPnAjvPodQysQHQaCKIlwbM3dcJYJTU5WSaf2NDJhTmIWsnWxtQvXTiJZfHzZlZp3EP_TjA7eVWSJ6rjjabs2zjHdEozM109qqWkHObt0P7n9YjD5-zuBC92fmYmvn-PoXYaWp9gJxyZ9qkCxx2qePKsEeY5TKELbST7J4pPTAUAj0j6uQUeeivxgrTP1s96-5n6dXgbdJhPQlE5KzBZJH_5xADPh32nEfgAM8piZQQucUaPw"
                  alt="Cursify Logo"
                  className="h-6 w-6 rounded-DEFAULT object-cover"
                />
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  Cursify
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant pr-4">
                Engineering the future of intelligent development. Seamlessly
                sync your workflow.
              </p>
            </div>

            {[
              {
                title: 'Product',
                links: ['Download IDE','Web Account','Pricing','Changelog'],
              },
              {
                title: 'Resources',
                links: ['Documentation','Agent API','Community Forum','Support'],
              },
              {
                title: 'Legal & Trust',
                links: [
                  'Security Center',
                  'Privacy Policy',
                  'Terms of Service',
                  'System Status',
                ],
              },
            ].map((col, i) => (
              <div key={i} className="flex flex-col gap-3 font-body-sm">
                <h4 className="font-headline-sm font-bold text-on-surface mb-2">
                  {col.title}
                </h4>
                {col.links.map((l, j) => (
                  <a
                    key={j}
                    href="#"
                    className="text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="max-w-container-max mx-auto border-t border-outline-variant/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              © 2024 Cursify AI. All rights reserved.
            </p>
            <div className="flex gap-4">
              {[0,1].map((_,i)=>(
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-on-primary transition-colors"
                >
                  <Icon src="/icons/link_512dp_E3E3E3_FILL0_wght400_GRAD0_opsz48.svg" className="w-4 h-4 text-inherit" />
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}

export default App
