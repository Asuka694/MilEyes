export default function Home() {

  return (
    <div>
      <h1 className="text-4xl font-bold text-onyx p-4">Dapp Demo</h1>
      <p className="text-onyx p-4">This is a starter demo built with celo-composer, a CLI template that allows you to quickly build, deploy, and iterate on decentralized applications using Celo.</p>
      <h2 className="text-xl font-bold text-onyx p-4">Need a one-minute video explanation?</h2>
      <div className="aspect-w-16 aspect-h-9">
        <iframe src="https://www.youtube.com/embed/pNEDt34utqk" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
      </div>
    </div>
  )
}
