import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComunService } from './services/comun.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  title = 'web';

  issues: Issue[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comunService: ComunService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      params => {
        params = params;
        console.log(`capturo: ${params.verifier}`);
        if (params.verifier != undefined && params.verifier != 'denied') {
          sessionStorage.setItem('verifier', params.verifier);
          if (sessionStorage.getItem('access') == null) {
            this.comunService.access().subscribe(
              rta => {
                console.log(rta.access);
                sessionStorage.setItem('access', rta.access);
                this.router.navigate(['']);
              }
            )
          }
        }
      }
    );
  }

  ngAfterViewInit(): void {
    if (sessionStorage.length == 0) {
      this.login();
    }
  }

  login() {
    this.comunService.login().subscribe(
      rta => {
        sessionStorage.setItem('token', rta.token);
        sessionStorage.setItem('secret', rta.secret);
        sessionStorage.setItem('url', rta.url);
        console.log(rta);
        document.location.href = rta.url;
      }
    )
  }

  logout() {
    sessionStorage.clear();
  }

  isLogged() {
    return sessionStorage.getItem('access') != null;
  }

  getIssues() {
    this.comunService.issues().subscribe(
      issues => {
        console.log(issues);
        this.issues = issues;
      }
    )
  }

}

export interface Issue {
  created: string;
  description: string;
  title: string;
  reporter: string
  type: string;
  priority: string;
  key: string;
}
