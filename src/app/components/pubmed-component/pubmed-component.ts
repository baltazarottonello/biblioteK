import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  signal,
  ViewChild,
  viewChild,
} from "@angular/core";

@Component({
  selector: "app-pubmed-component",
  imports: [],
  templateUrl: "./pubmed-component.html",
  styleUrl: "./pubmed-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PubmedComponent {
  downloadCsvLink = viewChild<ElementRef>("downloadCsvLink");
  showDownloadCsvButton = signal(false);
  renderer = inject(Renderer2);
  ids = signal("");
  async readFile(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const fileList = inputElement.files as FileList;
    const [file] = fileList;
    file.text().then((data: string) => {
      this.ids.set(data);
      console.log(this.ids());
    });
  }

  toCsv(data: any) {
    const formattedData = data.replaceAll(" ", "\n").split("\n").join(",");

    const blob = new Blob([formattedData], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    this.renderer.setAttribute(
      this.downloadCsvLink()?.nativeElement,
      "href",
      url
    );
    this.renderer.setAttribute(
      this.downloadCsvLink()?.nativeElement,
      "download",
      "datos.csv"
    );
    this.showDownloadCsvButton.set(true);
  }

  downloadCsv() {
    this.downloadCsvLink()?.nativeElement.click();
  }
}
