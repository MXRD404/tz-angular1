import { Component, OnInit } from '@angular/core';
import { MessageService } from './services/message.service';
import {
  BehaviorSubject,
  concatMap,
  delay,
  finalize,
  from,
  of,
  repeat,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  messages: string[] = [];
  bufferMessages: string[] = [];
  currentMessage = '';

  cleanBufferValue = false;
  paused = false;
  paused$ = new BehaviorSubject<boolean>(false); // Решил все сделать в одном файле для удобства

  // Изменяю поток для перенаправления значения в нужный массив
  fakeWs$ = this.messageService.messages$.pipe(
    tap((msg) => {
      if (!this.paused) {
        this.messages.push(msg);
        this.currentMessage = msg;
      } else {
        this.bufferMessages.push(msg);
      }
    })
  );

  constructor(public messageService: MessageService) {}

  // Подписки при старте
  ngOnInit(): void {
    this.paused$.subscribe((value) => {
      this.paused = value;
    });

    this.fakeWs$.subscribe();
  }

  // Функция для очистки буфера сообщений
  cleanBufferMessages() {
    // Включаю очистку, чтобы нельзя было тыкнуть кнопку пока она идет
    this.cleanBufferValue = true;

    from(this.bufferMessages)
      .pipe(
        concatMap((msg) => of(msg).pipe(delay(100))),
        tap((v) => {
          // Отображаем сообщение, добавляем его в массив и удаляем
          this.messages.push(v);
          this.currentMessage = v;
          this.bufferMessages.splice(0, 1);
        }),
        // Повторяем пока в массиве есть значение
        repeat({ delay: () => this.bufferMessages }),
        // Действия при завершении
        finalize(() => {
          this.paused$.next(false);
          this.cleanBufferValue = false;
        })
      )
      .subscribe();
  }

  toggle() {
    // Если буфер не пустой, запускаем функцию по его очистке
    if (this.bufferMessages.length) {
      this.cleanBufferMessages();
      return;
    }
    this.paused$.next(!this.paused);
  }
}
