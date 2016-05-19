import {Component} from '@angular/core';
import {Config} from './config.service';
import {LoginComponent} from "./server/login/login.component";

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.component.html',
    directives: [LoginComponent]
})
export class AppComponent {
    heading = Config.TITLE;
}
