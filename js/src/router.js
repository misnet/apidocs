import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import dynamic from 'dva/dynamic';

function RouterConfig({ history }) {
const IndexPage = dynamic({
  component:()=>import('./routes/IndexPage')
});
const DetailPage = dynamic({
  component:()=>import('./routes/DetailPage')
})
  return (
    <Router history={history}>
    <Switch>
    <Route path="/" exact component={IndexPage} />
    <Route path="/detail/:id" exact component={DetailPage} />
  </Switch>
  </Router>
);
}

export default RouterConfig;
