from twisted.internet.defer import inlineCallbacks
import wamptest
import os
import sys


class AppTests(wamptest.TestCase):

    @inlineCallbacks
    def test_call(self):
        response = yield self.call("com.example.test")
        self.assertTrue(response)


if __name__ == '__main__':

    realm = unicode(os.environ['ROUTER_REALM'])
    url = unicode(os.environ['ROUTER_URL'])

    errors = wamptest.main(
        test_cases=[AppTests],
        url=url,
        realm=realm,
        user="user",
        secret="secret"
    )

    sys.exit(errors)
