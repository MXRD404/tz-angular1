import { Injectable } from '@angular/core';
import {concatMap, delay, from, map, of, repeat, scan} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public messages = [
    'Lorem ipsum dolor sit amet.',
    'Lorem ipsum dolor sit amet, consectetur.',
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A amet animi at atque aut eveniet facere in minima non possimus, praesentium, recusandae rem. Consequatur doloremque iusto mollitia nobis obcaecati pariatur.',
    'Lorem.',
    'Lorem ipsum dolor sit.',
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
  ];
  public messages$ = from(this.messages).pipe(
    concatMap(r => of(r).pipe(delay(300))),
    repeat(),
    map(r => {
      return {
        msg: r,
        count: 0,
      }
    }),
    scan((acc, curr) => {
      curr.count = acc.count + 1;
      return curr;
    }),
    map(r => `${r.count} - ${r.msg}`),
  );
  constructor() {
    this.messages$.subscribe();
  }
}
