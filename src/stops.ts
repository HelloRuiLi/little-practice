import {
  Dictionary,
  get,
  last,
  merge,
  reduce,
} from 'lodash';

class Stops {
  links: Dictionary<any>;

  constructor(graphs: string) {
    this.links = this.getLinks(graphs);
  }

  getLinks(graphs: string) {
    return this.generateLinks(graphs);
  }

  generateLinks = (graph: string) => {
    const stops = graph.split(', ');
    return reduce(stops, (res: Dictionary<any>, item) => {
      const start = item.slice(0, 1);
      const end = item.slice(1, 2);
      const distance = item.slice(2);

      return merge(res, {
        [start]: {
          ...res[start],
          [end]: {
            distance,
          },
        },
      });
    }, {});
  };

  getRouteDistance(routeStr: string) {
    const routes = routeStr.split('-');
    const arr: any[] = [];
    reduce(routes, (res: any, item: string, index: number) => {
      if (index === 0) {
        return [routes[0]];
      }
      arr.push([last(res), item]);
      return [
        ...res,
        item,
      ]
    }, [routes[0]]);
    return arr;
  }

  calcRoutesDistance(routeStr: string) {
    const stopGroups: string[][] = this.getRouteDistance(routeStr);
    try {
      return reduce(stopGroups, (res: number, item: string[]) => {
        const distance = get(this.links, [...item, 'distance']);
        if (!distance) {
          throw new Error(' NO SUCH ROUTE');
        }
        return Number(res) + Number(distance);
      }, 0)
    } catch {
      return ' NO SUCH ROUTE'
    }
  }

  findRoutes(start: string, callback: any) {
    const res: any[][] = [];
    const calc = (links: any, routes: any[]) => {
      for (const key in links) {
        const arr = routes.concat(key);
        if (callback(key, arr)) {
          res.push(arr);
          return;
        }
        calc(this.links[key], arr);
      }
    };
    calc(this.links[start], [start]);
    return res;
  }
}

const stops = new Stops('AB5, BC4, CD8, DC8, DE6, AD5, CE2, EB3, AE7');

console.log('1: A_B_C: ', stops.calcRoutesDistance('A-B-C'));
console.log('2: A_D:', stops.calcRoutesDistance('A-D'));
console.log('3: A_D_C:', stops.calcRoutesDistance('A-D-C'));
console.log('4: A_E_B_C_D', stops.calcRoutesDistance('A-E-B-C-D'));
console.log('5: A_E_D', stops.calcRoutesDistance('A-E-D'));
console.log('links', stops.links);

console.log('minimal routes', stops.findRoutes('C', (key: string) => {
  return key === 'C';
}));

console.log('minimal routes', stops.findRoutes('A', (_: any, arr: any[]) => {
  return arr.length >= 5 && last(arr) === 'C';
}));

