import logging
import re
from urllib.parse import urljoin
import bs4
import requests
from bs4 import BeautifulSoup
import time
import model

logging.basicConfig(
    format='%(asctime)s %(levelname)s:%(message)s',
    level=logging.INFO)


class Crawler:

    def __init__(self, urls=[]):
        self.visited_urls = []
        self.urls_to_visit = urls

    def download_url(self, url):
        return requests.get(url).text

    def get_linked_urls(self, url, html):
        soup = BeautifulSoup(html, 'html.parser')
        content = soup.find('div', {'id': 'content'})
        sections = {}
        self.get_main_links(content, url, sections)
        self.get_contents_links(content, sections)
        return sections

    def get_contents_links(self, content, sections):
        other_sections = content.findAll('div', {'class': 'section'}, recursive=False)
        for section in other_sections:
            links = []
            for i, link in enumerate(section.findAll('h2')):
                path = link.find('a')['href']

                if 'sport5' in path:
                    links.append(path)
            if section.attrs['class'][1] in sections.keys():
                sections[f"{section.attrs['class'][1]}1"] = links
            else:
                sections[section.attrs['class'][1]] = links

    def get_main_links(self, content, url, sections):
        main_contents = content.find('div', {'class': 'row'})
        links = []
        for link in main_contents.findAll('h2'):
            path = link.find('a')['href']
            if 'sport5' in url:
                links.append(urljoin(url, path))
        sections['main'] = links

    def add_url_to_visit(self, url):
        if url not in self.visited_urls and url not in self.urls_to_visit:
            self.urls_to_visit.append(url)

    def crawl(self, url):
        html = self.download_url(url)
        sections = self.get_linked_urls(url, html)
        articles_per_section = {}
        for section, links in sections.items():
            articles_per_section[section] = []
            for link in links:
                article = self.get_article_from_url(link)
                articles_per_section[section].append(article)
        return articles_per_section

    def get_article_from_url(self, url):
        html = self.download_url(url)
        soup = BeautifulSoup(html, 'html.parser')
        if 'article' in url or 'playbasket' in url:
            content = soup.find('div', {'class': 'article-content'}).text
            # content = re.search('\n(.*)\n', content).group(1)
            text = content.replace(u'\xa0', u' ').replace('\n', '').replace('\r', '').replace('\t', '')
            text = text.replace(u'\xa0', u' ')
            return text
        elif 'dayevent' in url:
            title = soup.find('title').text.replace(u'\xa0', u' ').replace('\n', '').replace('\r', '').replace('\t', '')
            titles = [title]
            content = soup.find('div', {'class': 'table_cont_daka'}).contents[1].contents
            for c in content:
                if isinstance(c, bs4.element.Tag):
                    title = c.contents[3].contents[1].text
                    title = re.search('\n(.*)\n', title).group(1)
                    title = title.replace(u'\xa0', u' ').replace('\n', '').replace('\r', '').replace('\t', '')

                    titles.append(title)
            text = '\n'.join(titles)
            return text
        elif 'playbyplay':
            titles = []
            content = soup.find('div', {'class': 'online-game'}).findAll('div', {'class': 'text-box'})
            for c in content:
                titles.append(c.text.replace(u'\xa0', u' ').replace('\n', '').replace('\r', '').replace('\t', ''))

            text = '\n'.join(titles)
            return text

        # return content.text

    def run(self):
        while self.urls_to_visit:
            url = self.urls_to_visit.pop(0)
            logging.info(f'Crawling: {url}')
            try:
                return self.crawl(url)
            except Exception:
                logging.exception(f'Failed to crawl: {url}')
            finally:
                self.visited_urls.append(url)

def get_entities_from_articles(articles_per_section):
    entities = {}
    for section, articles in articles_per_section.items():
        section_entities = []
        for i,article in enumerate(articles):
            section_entities.append(model.get_entities_from_text(article))
        entities[section] = section_entities
    return entities


def main():
    # measure the time
    start = time.time()


    # init crawler
    crawler = Crawler(urls=['https://www.sport5.co.il/'])

    # run crawler
    articles = crawler.run()

    print('crawling time:', time.time() - start)

    start = time.time()
    # get entities
    entities = get_entities_from_articles(articles)
    print(entities)

    print('entities time:', time.time() - start)

if __name__ == '__main__':
    main()
