import React from 'react'
import { match, Router, browserHistory} from 'react-router'
import { render } from 'react-dom'
import routes from './routes';

const { pathname, search, hash } = window.location
const location = `${pathname}${search}${hash}`

// calling `match` is simply for side effects of
// loading route/component code for the initial location
console.log(window.__INITIAL_STATE__);
match({ routes, location }, () => {
  render(
    <Router routes={routes} history={browserHistory} />,
    document.getElementById('content')
  )
})
