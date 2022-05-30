import sched, time
import logging
import re
import threading
from urllib.parse import urljoin

import bs4
import requests
from bs4 import BeautifulSoup

import model

logging.basicConfig(
    format='%(asctime)s %(levelname)s:%(message)s',
    level=logging.INFO)
entities = {}

class Crawler:

    def __init__(self, urls=[]):
        self.visited_urls = []
        self.urls_to_visit = urls
        self.sections = {'main': []}

    def update_urls(self, urls):
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

    def get_sections(self, url):
        html = self.download_url(url)
        sections = self.get_linked_urls(url, html)
        return sections

    def crawl(self):

        articles_per_section = {}
        for section, links in self.sections.items():
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
                return self.crawl()
            except Exception:
                logging.exception(f'Failed to crawl: {url}')
            finally:
                self.visited_urls.append(url)

    def website_was_changed(self):
        # html = self.download_url('https://www.sport5.co.il/')
        sections = self.get_sections('https://www.sport5.co.il/')
        for section, links in sections.items():
            for link in links:
                if link not in self.sections[section]:
                    self.sections = sections
                    return True
        return False



def get_entities_from_articles(articles_per_section):
    entities = {}
    for section, articles in articles_per_section.items():
        section_entities = []
        for i, article in enumerate(articles):
            section_entities.append(model.get_entities_from_text(article))
        entities[section] = section_entities
    return entities





def main_loop(sc, crawler, no_changed_time=0):
    global entities
    # no_changed_time = 0
    if crawler.website_was_changed():

        crawler.update_urls(['https://www.sport5.co.il/'])

        # run crawler
        logging.info('Crawling...')
        articles = crawler.run()
        logging.info('Crawling finished')


        # get entities
        logging.info('Getting entities...')
        entities = get_entities_from_articles(articles)
        logging.info('Getting entities finished')
        print(entities)


    else:
        no_changed_time += 1
        logging.info(f'no change for {no_changed_time} minutes')
    sc.enter(60, 1, main_loop, (sc, crawler,no_changed_time))


s = sched.scheduler(time.time, time.sleep)
s.enter(60, 1, main_loop, (s, Crawler()))
threading.Thread(target=s.run).start()
