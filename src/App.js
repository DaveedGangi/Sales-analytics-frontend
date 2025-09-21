import { Route,Switch } from 'react-router-dom';

import Analytics from './components/analytics';


function App() {
  return (
      <div>
        <Switch>
        <Route path="/" component={Analytics}/>
        </Switch>
      </div>
  );
}

export default App;
