import Head from "next/head"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"

export const metadata = {
  title: "BD On Chain - Unlock 10,000+ Crypto Decision-Makers",
  description: "BD On Chain gives you direct access to crypto’s most active founders, BDs, and C-suites — all via Telegram. Private database. Zero noise. High-conversion leads.",
  icons: {
    icon: "https://pbs.twimg.com/profile_images/1938645384680878080/kPGeP32z_400x400.jpg",
  },
};


export default function LandingPage() {
  return (
    <>
      <Head>
        <title>BD On Chain - Unlock 10,000+ Crypto Decision-Makers</title>
        <meta
          name="description"
          content="BD On Chain gives you direct access to crypto’s most active founders, BDs, and C-suites — all via Telegram. Private database. Zero noise. High-conversion leads."
        />
        {/* Replace this href with your actual logo or favicon path */}
        <link rel="icon" href="https://pbs.twimg.com/profile_images/1938645384680878080/kPGeP32z_400x400.jpg" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Sticky Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="font-semibold text-xl text-gray-900">BD On Chain</div>
            <Link href="https://tally.so/r/meOAjJ" passHref>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                Request Access
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Unlock 10,000+ Crypto Decision-Makers.
            <br />
            <span className="text-gray-600">Telegram-First. Curated. Exclusive.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
            Stop guessing who to contact. BD On Chain gives you direct access to crypto's most active founders, BDs, and
            C-suites — all via Telegram.
            <br />
            <strong className="text-gray-900">Private database. Zero noise. High-conversion leads.</strong>
          </p>
          <Link href="https://tally.so/r/meOAjJ" passHref>
  <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
    <span className="inline-flex items-center">
      Request Access
      <ArrowRight className="ml-2 h-5 w-5" />
    </span>
  </Button>
</Link>

        </section>

        {/* Problem Section */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Crypto is Built on Telegram.
                  <br />
                  <span className="text-red-600">But Most Projects are Blindfolded.</span>
                </h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>Everyone knows deals in Web3 start on Telegram — not cold emails.</p>
                  <p>Yet most BD teams waste weeks figuring out:</p>
                  <ul className="space-y-2 ml-6 list-disc marker:text-gray-500">
                    <li>Who's behind a project</li>
                    <li>How to reach them</li>
                    <li>Whether they'll even reply</li>
                  </ul>
                  <p className="font-semibold text-gray-900 pt-4">
                    You're not missing opportunity — you're missing access.
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                We Spent 5 Years Inside Crypto Telegrams.
                <br />
                <span className="text-green-600">Now You Can Leverage It Instantly.</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                BD On Chain is a curated vault of 10,000+ real Telegram profiles:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Founders, Core Contributors, Growth Heads</h3>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Across DeFi, L2s, Infra, DAOs, and more</h3>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Tagged by company, role, and category</h3>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Filtered for signal, not spam</h3>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-xl text-gray-700 mb-2">This isn't another email list.</p>
              <p className="text-xl font-semibold text-gray-900 mb-8">
                This is raw BD firepower — where crypto conversations actually happen.
              </p>
              <Link href="https://tally.so/r/meOAjJ" passHref>
  <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg mr-4">
    <span className="inline-flex items-center">
      Request Access
      <ArrowRight className="ml-2 h-5 w-5" />
    </span>
  </Button>
</Link>


            </div>
          </div>
        </section>

        {/* Who It's For Section */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">You'll Get Value If You're:</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm bg-blue-100 text-blue-800">
                  Founder
                </Badge>
                <p className="text-gray-700">Looking for strategic collabs or distribution</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm bg-green-100 text-green-800">
                  Growth/BD Lead
                </Badge>
                <p className="text-gray-700">Needing faster deal flow</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm bg-purple-100 text-purple-800">
                  Crypto Project
                </Badge>
                <p className="text-gray-700">Expanding into new ecosystems</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm bg-orange-100 text-orange-800">
                  VC-Backed Startup
                </Badge>
                <p className="text-gray-700">Wanting post-raise exposure</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-gray-100 text-gray-800">
                Solo Dev / Studio
              </Badge>
              <p className="text-gray-700 mt-2">With zero time to network manually</p>
            </div>
          </div>
        </section>

        {/* Why It Works Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Why Teams Rely on BD On Chain</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Telegram-first</h3>
                      <p className="text-gray-600">Built for crypto's real channels</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Zero fluff</h3>
                      <p className="text-gray-600">Only actionable, human-verified profiles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Saves 100+ hours</h3>
                      <p className="text-gray-600">No manual scraping, lurking, or guessing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Proven results</h3>
                      <p className="text-gray-600">Used by top growth teams to accelerate BD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Direct access</h3>
                      <p className="text-gray-600">Get to the right person, faster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <p className="text-lg text-gray-600 mb-4">Already powering BD for projects across zk, infra, and DeFi.</p>
              <blockquote className="text-xl italic text-gray-700 mb-8">
                "We closed our first ecosystem collab in 3 days using BD On Chain."
              </blockquote>
              <Badge variant="outline" className="border-orange-200 text-orange-800 bg-orange-50 px-4 py-2">
                Only 10 vault passes released per month to maintain value
              </Badge>
            </div>
          </div>
        </section>

        {/* Offer Section */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Exclusive Access. Limited Availability.</h2>
            <p className="text-xl text-gray-600 mb-12">
              This isn't a mass-market tool. BD On Chain is designed for serious crypto teams who value quality over
              quantity.
            </p>
            <div className="space-y-4">
              <Link href="https://tally.so/r/meOAjJ" passHref>
  <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg mr-4">
    <span className="inline-flex items-center">
      Request Access
      <ArrowRight className="ml-2 h-5 w-5" />
    </span>
  </Button>
</Link>



              <Link href="http://t.me/ZeroxMukund" passHref>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg bg-transparent"
              >
                <span className="inline-flex items-center">
                Contact via Telegram
                </span>
              </Button>

                </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-12">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to unlock crypto's most valuable connections?
              </h3>
              <div className="space-x-4">
                <Link href="https://tally.so/r/meOAjJ" passHref>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                    Request Access
                  </Button>
                </Link>

                <Link href="http://t.me/ZeroxMukund" passHref>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                  Contact via Telegram
                </Button>

                  </Link>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p>&copy; 2025 BD On Chain. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}