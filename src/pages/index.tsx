import { NextPage } from 'next'
import Layout from '../components/Layout'

const IndexPage: NextPage = () => (
  <Layout title="Home | Next Starter Kit">
    <div className="flex items-center justify-center min-h-screen p-4 text-center">
      <div className="p-5 bg-white rounded-lg shadow-xl sm:max-w-md sm:w-full">
        <img src="/img/logo.png" className="w-20 h-20 mx-auto -mt-10 rounded-full shadow-lg" />
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-xl font-semibold leading-6 text-gray-800">Next Starter Kit</h3>
          <div className="mt-2">
            <p className="text-gray-500">
              Welcome to the{' '}
              <a className="font-semibold hover:text-indigo-500" href="https://www.apideck.com">
                Apideck
              </a>{' '}
              boilerplate for building React applications with Next.js, TypeScript, and Tailwind
              CSS.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
)

export default IndexPage
