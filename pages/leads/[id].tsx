import { useEffect } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { makeSerializable } from "../../lib/util";
import prisma from "../../lib/prisma";
import Layout from "../../components/Layout";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const lead = await prisma.lead.findUnique({ where: { id: Number(context.params.id) } });

  // There are two ways to authenticate your UI components.
  //   Option 1 is with a short lived userToken generated by our API
  //   Option 2 is with a JWT using your account secret.
  //
  // This is an example of Option 1.
  const options = {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.EMBED_WORFKLOW_SK}` },
  };

  const res = await fetch(
    "https://embedworkflow.com/api/v1/user_token",
    options
  ).then((response) => response.json());
  return {
    props: {
      embedWorkflowPk: process.env.EMBED_WORFKLOW_PK,
      userToken: res.client_token,
      lead: makeSerializable(lead),
    },
  };
};

const Lead: NextPage = (props) => {
  const { lead, userToken, embedWorkflowPk } = props;
  const loadWorkflows = () => {
    EWF.load(embedWorkflowPk, { userToken });
  };

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://cdn.ewf.to/ewf-0033.js";
    script.onload = loadWorkflows;

    document.body.appendChild(script);
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="sm:flex sm:items-center text-left">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Lead</h1>
            <p className="mt-2 text-sm text-gray-700">
              Information for {lead.name}.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link href="/leads" legacyBehavior>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                See all leads
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="relative py-3 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr key={lead.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {lead.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lead.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lead.phone}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl overflow-hidden">
        {lead.executionHashid && (
          <div className="mt-8 text-left overflow-auto">
            <div>
              <link
                rel="stylesheet"
                media="screen"
                href="https://cdn.ewf.to/ewf-0033.css"
              />

              <div
                className="EWF__execution_viewer"
                data-hashid={lead.executionHashid}
              ></div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Lead;
