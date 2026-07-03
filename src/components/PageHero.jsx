// warm-trust shared hero band for content/interior pages.
// Keeps every secondary page consistent with the homepage petrol language.
export default function PageHero({ icon: Icon, title, subtitle, meta }) {
  return (
    <section className="bg-petrol text-white">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-14 lg:py-20 text-center">
        {Icon && (
          <span className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-white/10 shadow-lift mb-5">
            <Icon width="30" height="30" />
          </span>
        )}
        <h1 className="font-heading font-black text-3xl lg:text-5xl tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
        )}
        {meta && <p className="mt-3 text-white/60 text-sm">{meta}</p>}
      </div>
    </section>
  )
}
