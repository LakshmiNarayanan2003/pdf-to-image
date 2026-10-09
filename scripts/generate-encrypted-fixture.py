"""Optional fixture regeneration: Python 3 + pypdf==6.19.0. No proprietary input."""
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ByteStringObject, ArrayObject
writer = PdfWriter()
writer.append(PdfReader('tests/fixtures/text.pdf'))
writer._ID = ArrayObject([ByteStringObject(b'PDF2Pix-fixture01')] * 2)
writer.encrypt('local-test-password', algorithm='RC4-128')
with open('tests/fixtures/encrypted.pdf', 'wb') as output:
    writer.write(output)
