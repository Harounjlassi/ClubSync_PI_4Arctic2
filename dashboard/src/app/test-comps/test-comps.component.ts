import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import { StorageService } from 'app/services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-comps',
  templateUrl: './test-comps.component.html',
  styleUrls: ['./test-comps.component.scss']
})
export class TestCompsComponent implements OnInit {
  content?: string;
  userName?: string;
  isLoading = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
   
  }

  logout(): void {
    this.storageService.clean();
    this.router.navigate(['/login']);
  }
}
