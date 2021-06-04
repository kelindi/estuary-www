import S from "~/pages/index.module.scss";
import pkg from "~/package.json";

import * as React from "react";
import * as U from "~/common/utilities";
import * as R from "~/common/requests";

import Page from "~/components/Page";
import Navigation from "~/components/Navigation";
import Card from "~/components/Card";
import Button from "~/components/Button";
import FeatureRow from "~/components/FeatureRow";
import MarketingCube from "~/components/MarketingCube";
import SingleColumnLayout from "~/components/SingleColumnLayout";
import Chart from "~/components/Chart";

import { H1, H2, H3, P } from "~/components/Typography";
import { MarketingUpload, MarketingProgress, MarketingGraph } from "~/components/Marketing";

export async function getServerSideProps(context) {
  const viewer = await U.getViewerFromHeader(context.req.headers);

  return {
    props: { viewer },
  };
}

function useWindowSize() {
  const [size, setSize] = React.useState([0, 0]);
  React.useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

function IndexPage(props) {
  const [width, height] = useWindowSize();
  const [state, setState] = React.useState({ miners: [], totalStorage: 0, totalFiles: 0 });
  const [graph, setGraph] = React.useState({ data: null });

  React.useEffect(async () => {
    const miners = await R.get("/public/miners");
    const stats = await R.get("/public/stats");

    if ((miners && miners.error) || (stats && stats.error)) {
      return setState({ miners: [], totalStorage: 0, totalFiles: 0 });
    }

    setState({ ...state, miners, ...stats });
  }, []);

  React.useEffect(async () => {
    const load = async () => {
      const data = await R.get("/public/metrics/deals-on-chain");

      let dealsAttempted = 0;
      let dealsAttemptedSet = [];
      let dealsFailed = 0;
      let dealsFailedSet = [];
      let dealsOnChain = 0;
      let dealsOnChainSet = [];
      let dealsOnChainBytes = 0;
      let dealsOnChainBytesSet = [];
      let dealsSealed = 0;
      let dealsSealedSet = [];
      let dealsSealedBytes = 0;
      let dealsSealedBytesSet = [];

      for (let item of data) {
        dealsAttempted = dealsAttempted + item.dealsAttempted;
        dealsFailed = dealsFailed + item.dealsFailed;
        dealsOnChain = dealsOnChain + item.dealsOnChain;
        dealsOnChainBytes = dealsOnChainBytes + item.dealsOnChainBytes;
        dealsSealed = dealsSealed + item.dealsSealed;
        dealsSealedBytes = dealsSealedBytes + item.dealsSealedBytes;

        // TODO(jim): Tell Jeromy this date is annoying
        if (item.time === "0001-01-01T00:00:00Z") {
          continue;
        }

        const date = new Date(item.time);

        dealsAttemptedSet.push({ date, value: dealsAttempted });
        dealsFailedSet.push({ date, value: dealsFailed });
        dealsOnChainSet.push({ date, value: dealsOnChain });
        dealsOnChainBytesSet.push({ date, value: dealsOnChainBytes });
        dealsSealedSet.push({ date, value: dealsSealed });
        dealsSealedBytesSet.push({ date, value: dealsSealedBytes });
      }

      setGraph({
        dealsSealedBytes,
        data: [
          {
            color: "var(--status-16)",
            name: "Attempted",
            items: dealsAttemptedSet,
          },
          {
            color: "var(--status-7)",
            name: "Failed",
            items: dealsFailedSet,
          },
          {
            color: "var(--status-6)",
            name: "OnChain",
            items: dealsOnChainSet,
          },
          {
            color: "var(--status-success-bright)",
            name: "Sealed",
            items: dealsSealedSet,
          },
        ],
      });
    };

    load();
  }, [width]);

  const description =
    "Use any browser and our API to store public data on the Filecoin Network and retrieve it from anywhere, anytime.";

  return (
    <Page title="Estuary" description={description} url="https://estuary.tech">
      <Navigation active="INDEX" isAuthenticated={props.viewer} />

      <div className={S.h}>
        <div className={S.ht}>
          <H1 style={{ maxWidth: "768px", fontWeight: 800 }}>Automated storage with Filecoin</H1>
          <P style={{ marginTop: 12, maxWidth: "768px", fontSize: "1.15rem", opacity: "0.7" }}>
            {description}
          </P>
          <div className={S.actions}>
            <Button
              href="https://docs.estuary.tech"
              target="_blank"
              style={{
                background: `var(--main-primary)`,
                margin: "0 16px 0 0",
                fontSize: "24px",
                padding: "16px 24px 16px 24px",
              }}
            >
              Learn more
            </Button>
          </div>
          <img
            className={S.hbimg}
            src="https://next-s3-public.s3-us-west-2.amazonaws.com/estuary-marketing-hero.png"
          />
        </div>
      </div>

      <div className={S.stats}>
        <div className={S.sc}>
          <div className={S.scn}>{state.totalFiles ? state.totalFiles.toLocaleString() : null}</div>
          <div className={S.scl}>Files stored</div>
        </div>
        <div className={S.sc}>
          <div className={S.scn}>{state.dealsOnChain}</div>
          <div className={S.scl}>Deals on chain</div>
        </div>
        <div className={S.sc}>
          <div className={S.scn}>{U.bytesToSize(state.totalStorage)}</div>
          <div className={S.scl}>Total storage</div>
        </div>
        {graph.dealsSealedBytes ? (
          <div className={S.sc}>
            <div className={S.scn}>{U.bytesToSize(graph.dealsSealedBytes)}</div>
            <div className={S.scl}>Sealed storage</div>
          </div>
        ) : null}
      </div>

      <SingleColumnLayout style={{ textAlign: "center", marginBottom: 24 }}>
        <H2 style={{ margin: "0 auto 0 auto" }}>Features</H2>
        <P style={{ marginTop: 12, maxWidth: "768px", fontSize: "1.15rem", opacity: "0.7" }}>
          Estuary makes using Filecoin easy while showing a lot of useful information about where
          your data is stored.
        </P>
      </SingleColumnLayout>

      <div className={S.r}>
        <div className={S.rl}>
          <div className={S.rtext}>Upload public data</div>
          <FeatureRow>
            <strong>No minimum size</strong>. Upload the data you want, Estuary Nodes will figure
            out the rules for you.
          </FeatureRow>
          <FeatureRow>
            <strong>Many options.</strong> Tired of browsers? Use the command line, or an{" "}
            <a href="https://docs.estuary.tech" target="_blank">
              API
            </a>{" "}
            in your own application or website.
          </FeatureRow>
          <FeatureRow>
            <strong>Global access.</strong> Retrieve your data from any IPFS gateway.
          </FeatureRow>
        </div>
        <div className={S.rr}>
          <MarketingUpload
            estimate="0"
            price="0"
            size="792259920"
            replication="6"
            duration={1051200}
            verified={true}
          />
        </div>
      </div>

      <div className={S.r}>
        <div className={S.rl}>
          <div className={S.rtext}>All about the details</div>
          <FeatureRow>
            <strong>Reliability</strong>. Estuary Nodes have automation algorithms that make sure
            your data is replicated and stored on the network.
          </FeatureRow>
          <FeatureRow>
            <strong>A ton of information</strong>. Logs, status updates, and deal data. Know
            everything about the resilence of your storage so you can make better promises.
          </FeatureRow>
        </div>
        <div className={S.rr}>
          <MarketingProgress />
        </div>
      </div>

      <SingleColumnLayout style={{ textAlign: "center" }}>
        <H2 style={{ margin: "0 auto 0 auto" }}>Open source, public logs</H2>
        <P style={{ marginTop: 12, maxWidth: "768px", fontSize: "1.15rem", opacity: "0.7" }}>
          Logs from your Filecoin miner are public so we can help debug and triage issues with the
          Filecoin Network.
        </P>
      </SingleColumnLayout>

      {graph.data ? (
        <div className={S.graphArea}>
          <Chart
            data={graph.data}
            dimensions={{
              width: width - 88,
              height: 480 + 20,
              margin: {
                top: 30,
                right: 30,
                bottom: 30,
                left: 60,
              },
            }}
          />
        </div>
      ) : null}

      <footer className={S.f}>
        {graph.data ? (
          <div className={S.fa}>
            {graph.data.map((each) => {
              return (
                <div className={S.fcol4} key={each.name}>
                  <div
                    className={S.graphItem}
                    style={{ background: each.color, color: `var(--main-text)` }}
                  >
                    {each.name}: {each.items[each.items.length - 1].value}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className={S.fa}>
          <div className={S.fcol4}>
            <span className={S.flink}>Index</span>
          </div>
          <div className={S.fcolfull}>
            <span className={S.flink}>
              All of the miners that store data from this Estuary node.
            </span>
          </div>
        </div>
        {state.miners.map((each, index) => {
          if (each.suspended) {
            return (
              <div className={S.fa} key={each.addr}>
                <div className={S.fcol4}>
                  <span className={S.flink} style={{ background: `var(--status-error)` }}>
                    {each.addr} suspended
                  </span>
                </div>
                <div className={S.fcolfull}>
                  <span className={S.flink} style={{ background: `var(--status-error)` }}>
                    reason: {each.suspendedReason}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div className={S.fam} key={each.addr}>
              <div className={S.fcol4}>
                <a className={S.flink} href={`/miners/stats/${each.addr}`}>
                  {`${index}`.padStart(4, 0)} {!U.isEmpty(each.name) ? `— ${each.name}` : null}
                </a>
              </div>
              <div className={S.fcol4}>
                <a className={S.flink} href={`/miners/stats/${each.addr}`}>
                  ➝ {each.addr}/stats
                </a>
              </div>
              <div className={S.fcol4}>
                <a className={S.flink} href={`/miners/deals/${each.addr}`}>
                  ➝ {each.addr}/deals
                </a>
              </div>
              <div className={S.fcol4}>
                <a className={S.flink} href={`/miners/errors/${each.addr}`}>
                  ➝ {each.addr}/errors
                </a>
              </div>
            </div>
          );
        })}
      </footer>

      <div className={S.fb}>
        <a href="https://arg.protocol.ai" target="_blank" className={S.fcta}>
          ➝ Built by ꧁𓀨꧂
        </a>
      </div>
    </Page>
  );
}

export default IndexPage;
