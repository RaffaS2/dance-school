-- Adiciona coluna de URL de imagem à tabela items
ALTER TABLE items ADD COLUMN image_url VARCHAR(500) NULL;

-- Criar index para melhor performance se necessário
-- CREATE INDEX idx_items_image_url ON items(image_url);
