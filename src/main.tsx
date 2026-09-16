import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { frameworks, tools } from './model';
import { PageIntro, SourceNote } from './components/shared';
import { Preview } from './Preview';
import './style.css';
const repository = 'https://github.com/jimlunsford/only-empowerment';
function route() { return location.hash.slice(1) || '/'; }
function Home() {
  return <>
    <section class="hero"><div><p class="eyebrow">Practical tools. Your decisions.</p><h1 tabIndex={-1}>Think clearly.<br/>Choose deliberately.<br/><span>Act on what is yours.</span></h1><p class="hero-copy">A place to sort out the decision, define the standard, and find the action you can take next.</p><div class="hero-actions"><a class="button primary" href="#/tools">Explore the tools <span aria-hidden="true">↗</span></a><a class="quiet-link" href="#/approach">How it works</a></div><p class="privacy-line"><span class="small-square" aria-hidden="true"/>No account. No trackers. No answer collection.</p></div>
    <aside class="hero-note"><p class="eyebrow">The work belongs to you</p><p class="note-title">A useful question.<br/>A clearer choice.<br/>Something to do.</p><p>The tool helps you think.<br/>You make the decision.</p><div class="note-divider"/><p class="small">Leave with a record you can use.<br/>Leave when you are ready to act.</p></aside></section>
    <section class="tools-section" aria-labelledby="tools-title"><div class="section-heading"><div><p class="eyebrow">The tool collection</p><h2 id="tools-title">Start with what is in front of you.</h2></div><p>Six tools in development.<br/>Each has a different job.</p></div><ToolGrid/></section>
    <section class="bottom-band"><div><p class="eyebrow">Private by design</p><h2>Your thinking should stay yours.</h2></div><div><p>This preview has no accounts, saved responses, or analytics. Read what the application does, what the browser may retain, and where the limits are.</p><a href="#/privacy">Understand your privacy <span aria-hidden="true">↗</span></a></div></section>
  </>;
}
function ToolGrid() {
  return <div class="tool-grid">{tools.map((tool, i) => <a class="tool-card" key={tool.id} href={`#/tools/${tool.id}`}><div class="card-top"><span class="tool-number">0{i + 1}</span><span class="availability">In development</span></div><p class="situation">{tool.situation}</p><h3>{tool.name}</h3><p>{tool.description}</p><div class="card-bottom"><span>{tool.output}</span><span aria-hidden="true">↗</span></div></a>)}</div>;
}
function ToolsPage() { return <><PageIntro label="The tool collection" title="Different situations. Useful next steps."><p>Choose by what you need to work through. These outlines describe the planned tools. None of the six is ready to use yet.</p></PageIntro><ToolGrid/><div class="preview-invitation"><h2>See the interaction direction.</h2><p>A short preview shows a lesson, a reflection, and a copyable card. It is a design sample, not a finished tool.</p><a class="button" href="#/preview">Open workflow preview</a></div></>; }
function ToolPage({ id }: { id: string }) {
  const tool = tools.find(t => t.id === id);
  if (!tool) return <NotFound/>;
  const next = tools.find(t => t.id === tool.handoff);
  return <div class="narrow"><a class="back-link" href="#/tools">← All tools</a><PageIntro label="Tool outline · In development" title={tool.name}><p>{tool.description}</p></PageIntro><div class="detail-panel"><h2>{tool.situation}</h2><p>This tool will help you work through questions such as:</p><ul class="question-list">{tool.questions.map(q => <li key={q}>{q}</li>)}</ul><div class="deliverable"><p class="eyebrow">What you will leave with</p><h2>{tool.output}</h2><p>A clear record in your own words, ready to keep, copy, or print.</p></div><SourceNote items={tool.frameworks}/></div>{next && <section class="handoff-outline"><h2>When a next tool is useful</h2><p>An optional continuation to {next.name} will help carry selected work forward. You will choose what to bring. Nothing will move automatically.</p></section>}<p class="availability-note">This tool is not available yet. <a href="#/preview">View the interaction preview</a>.</p></div>;
}
function Approach() {
  return <div class="narrow"><PageIntro label="How it works" title="Understand it. Use it. Make it yours."><p>You should not need to study a system before you can use a tool. A short lesson gives you the distinction you need for the next question.</p></PageIntro>
    <ol class="approach-steps">{[['Lesson','Learn a useful distinction at the moment it matters.'],['Reflection','Apply it to the situation in front of you.'],['Decision','Choose what you are willing to do. The application does not choose for you.'],['Action','Define a real step you can take outside this page.'],['Result','Record what happened, including what still needs correction.']].map(([name,text],i) => <li key={name}><span class="step-number">0{i+1}</span><div><h2>{name}</h2><p>{text}</p></div></li>)}</ol>
    <section class="principle-panel"><h2>Support should increase capability.</h2><p>No scores, streaks, or labels. No reason to keep feeding a system once you have what you need. The aim is useful work you can take into your life.</p></section>
    <section class="framework-list"><h2>The thinking behind the tools</h2><p>These frameworks were developed by Jim Lunsford. The application teaches small, relevant parts of them. The full explanations live on JimLunsford.com.</p>{Object.values(frameworks).map(f => <a href={f.url} rel="noreferrer" key={f.url}><span>{f.name}</span><span>{f.role} ↗</span></a>)}</section></div>;
}
function Privacy() {
  return <div class="narrow"><PageIntro label="Privacy & source" title="Your answers are not ours to collect."><p>This page describes the current foundation preview. It is a statement of what this version does, not a promise about features that have not been built.</p></PageIntro>
    <div class="privacy-facts"><section><h2>What stays in the page</h2><p>The workflow preview holds your response in browser memory. It does not write answers to local storage, session storage, cookies, or a database. The application discards the response when you leave the preview or refresh the page.</p><p>Use “Clear preview” to clear the current response. There is no saved local answer collection to delete in this version.</p></section>
    <section><h2>What leaves the browser</h2><p>Your browser requests the application files from the host. Those requests expose ordinary connection information, such as your IP address and requested file paths. The application has no answer-submission endpoint and does not intentionally send your response over the network.</p><p>Hosting systems may keep operational logs. The exact staging log retention must be verified before staging is described as fully reviewed.</p></section>
    <section><h2>No trackers. No AI service.</h2><p>No advertising, analytics, session replay, remote fonts, third-party scripts, or AI APIs are loaded by the application. Links to JimLunsford.com and GitHub open those sites only when you choose them, with no answer content added to the link.</p></section>
    <section><h2>Copy and print are your choice</h2><p>Copying puts the card on your device’s clipboard. Your operating system may sync that clipboard. Printing or saving a PDF passes content to your browser and printing system. Those copies are yours to manage and are not removed by clearing this preview.</p></section>
    <section><h2>The limits matter</h2><p>This is not encrypted private storage. Shared devices, browser extensions, browser recovery features, screenshots, and a compromised device or host can expose information. No website can prove privacy simply by publishing its source.</p></section>
    <section><h2>Inspect the source</h2><p>The footer links this build to its Git commit. Public source helps you inspect intended behavior; a commit label alone does not prove the delivered files match it. The build also includes file checksums for deployment verification.</p><a class="button" href={repository} rel="noreferrer">View the source on GitHub ↗</a><p class="small">Public source. Licensing decision pending.</p></section></div></div>;
}
function NotFound() { return <div class="narrow"><PageIntro label="Page not found" title="That page is not here."><p><a href="#/tools">Explore the tool collection</a> or <a href="#/">return home</a>.</p></PageIntro></div>; }
function App() {
  const [path, setPath] = useState(route);
  const initial = useRef(true);
  useEffect(() => { const onHash = () => setPath(route()); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, []);
  useEffect(() => {
    const heading = document.querySelector('h1'); document.title = `${heading?.textContent || 'Page'} | Only Empowerment`;
    if (initial.current) { initial.current = false; return; }
    heading?.focus(); window.scrollTo(0, 0);
  }, [path]);
  let content;
  if (path === '/') content = <Home/>;
  else if (path === '/tools') content = <ToolsPage/>;
  else if (path === '/approach') content = <Approach/>;
  else if (path === '/privacy') content = <Privacy/>;
  else if (path === '/preview') content = <Preview/>;
  else if (path.startsWith('/tools/')) content = <ToolPage id={path.slice(7)}/>;
  else content = <NotFound/>;
  return <><a class="skip-link" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
    <header class="site-header"><a class="wordmark" href="#/" aria-label="Only Empowerment home">only<span>empowerment</span><span class="brand-dot" aria-hidden="true">.</span></a><nav aria-label="Main navigation"><a href="#/tools" aria-current={path.startsWith('/tools') ? 'page' : undefined}>The tools</a><a href="#/approach" aria-current={path === '/approach' ? 'page' : undefined}>The approach</a><a href="#/privacy" aria-current={path === '/privacy' ? 'page' : undefined}>Privacy & source</a></nav></header>
    <div class="staging-banner"><span class="stage-label">Foundation preview</span><span>The tools are in development. Explore the direction.</span><a href="#/preview">Try the interaction preview <span aria-hidden="true">↗</span></a></div>
    <main id="main" tabIndex={-1} class="site-main">{content}</main>
    <footer class="site-footer"><div><p>Built by <a href="https://jimlunsford.com/" rel="noreferrer">Jim Lunsford</a></p><p class="small">Practical tools. Ownership stays with you.</p></div><div class="footer-meta"><a href="#/privacy">Privacy & source</a><p class="small">v{__BUILD__.version} · {__BUILD__.dirty ? <span>local changes · base {__BUILD__.commit.slice(0,7)}</span> : <a href={__BUILD__.source} rel="noreferrer">source {__BUILD__.commit.slice(0,7)}</a>}</p></div></footer></>;
}
render(<App/>, document.getElementById('app')!);
